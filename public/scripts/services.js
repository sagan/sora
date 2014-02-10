
app.factory('AppService', function($rootScope, $q, $location, $http, $window, localStorageService) {
	var AppService = {};
	
	var config = {};
	
	var meta = {
		loaded: false,
		online: true,
	};
	
	meta.root_url = $location.protocol() + '://' +  $location.host() + ($location.port() != ( $location.protocol() == "http" ? 80 : 443 ) ? ':' + $location.port() : '') + $("base").attr("href");
	meta.api_root = "api/";
	
	angular.copy(localStorageService.get('config'), config);
	
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if( current.$$route )
			meta.page_title = current.$$route.title;
		meta.page_id = $location.path();
		if( config.env == 'development' ) {
			$window.applicationCache.update(); // Attempt to update the user's cache.
		}
	});
	
	$http({method: 'GET', url: meta.api_root + 'config'}).success(function(data, status, headers, httpconfig) {
		angular.copy(data, config);
		if( !config.site_tagline )
			config.site_tagline = "version " + config.version;
		localStorageService.add("config", config);
		$window.disqus_shortname = config.disqus_shortname;
		meta.loaded = true;
	}).error(function(data, status, headers, config) {
		console.log("ajax get config error");
	});

	AppService.config = config;
	AppService.meta = meta;
	
	Offline.options = {checkOnLoad: true, checks: {xhr: {url: meta.api_root + 'online'}}};
	
	Offline.on("down", function() {
		console.log('server down');
		meta.online = false;
	});
	
	Offline.on("up", function() {
		console.log('server up');
		meta.online = true;
	});


	// Check if a new cache is available on page load.
	$window.addEventListener('load', function(e) {
		$window.applicationCache.addEventListener('updateready', function(e) {
			if ( $window.applicationCache.status == $window.applicationCache.UPDATEREADY) {
				// Browser downloaded a new app cache.
				console.log("App new version found, reload");
				if ( config.env == 'development' || confirm('A new version of this site is available. Load it now?')) {
					//$window.applicationCache.swapCache();
					$window.location.reload();
				}
			} else {
				// Manifest didn't changed. Nothing new to server.
			}
		}, false);
	}, false);
	
	return AppService;
	
});

app.factory('APIService', function($q, $http, AppService) {
	var api = {};
	
	var meta = {};
	
	var event_callbacks = {};

	//register an observer
	var watch = function(event, callback){
		if( !event_callbacks[event] )
			event_callbacks[event] = [];
		event_callbacks[event].push(callback);
	};
	
  //call this when you know 'foo' has been changed
	var notify = function(event){
		angular.forEach(event_callbacks[event], function(callback){
			callback();
		});
	};
	
	var tags_store_schema = {
		name: 'tags',
		keyPath: '_id', // optional, 
		autoIncrement: false, // optional. 
		indexes: [{
      name: 'name', // optional
      keyPath: 'name',
      unique: false, // default
      multiEntry: false // default
    }]
	};
	
	var db_schema = {
		stores: [tags_store_schema]
	};
	
	var db = new ydn.db.Storage('sora', db_schema);
	
	var clear_collection = function(collection) {
		var defer = $q.defer();
		var iter = new ydn.db.ValueIterator(collection);
		var mode = 'readwrite';
		var updated = 0;
		var deleted = 0;
		db.open(function(cursor) {
			var author = cursor.getValue();
			cursor.clear().then(function(e) {
				deleted++;
			}, function(e) {
				throw e;
			});
		}, iter, mode).then(function() {
			console.log('localstorage db collection ' + collection + ' cleared: ' + deleted + ' deleted.');
			defer.resolve();
		}, function(e) {
			defer.reject();
		});
		return defer.promise;
	};

	var fetch_tags = function() {
		$http({method: 'GET', url: AppService.meta.api_root + 'tags'}).success(function(data, status, headers, httpconfig) {
			console.log("fetch server tags success", data);
			if( !data.error && data.items && data.items.length ) {
				clear_collection("tags").then(function() {
					db.put('tags', data.items);
					notify("tags");
				});
			}
		}).error(function(data, status, headers, httpconfig) {
		});
	};

	var get_tags = function() {
		var defer = $q.defer();
		
		var items = [];
		
		var iter = new ydn.db.ValueIterator("tags");
		var mode = 'readonly';
		db.open(function(cursor) {
			var item = cursor.getValue();
			items.push(item);
		}, iter, mode).then(function() {
			console.log('localstorage db collection queryed', items);
			defer.resolve({items: items});
		}, function(e) {
			console.log('localstorage db collection queryed', []);
			defer.reject({items: []});
		});
		
		return defer.promise;
	};
	
	fetch_tags();
	
	api.meta = meta;
	api.get_tags = get_tags;
	api.watch = watch;
	
	return api;
});

app.factory('TagService', function($q, $http, AppService, APIService) {
	var TagService = {};
	
	var config = AppService.config;
	
	var api_meta = APIService.meta;
	
	var tags = [];
	
	var colors = ["red", "blue", "cyan", "green", "yellow", "gray"];
	
	var process_tag_colors = function() {
		for(var i =0; i < tags.length; i++) {
			var index = Math.floor(Math.random() * (colors.length - 1 - 0 + 1) + 0);
			tags[i].color = colors[index];
		}
	};
	
	var get_tags = function() {
		APIService.get_tags().then(function(data) {
			tags.length = 0;
			tags.push.apply(tags, data.items);
			process_tag_colors();
		});
	};
	APIService.watch('tags', get_tags);
	get_tags();
	/*
	$http({method: 'GET', url: AppService.meta.api_root + 'tags'}).success(function(data, status, headers, httpconfig) {
		if( !data.error ) {
			tags.push.apply(tags, data.items);
			process_tag_colors();
		}
	}).error(function(data, status, headers, httpconfig) {

	});
	*/
	
	TagService.tags = tags;
	
	return TagService;
	
});

app.factory('FileService', function($q, $http, AppService) {
	var FileService = {};
	
	var config = AppService.config;
	var files = [];
	var meta = {};
	
	$http({method: 'GET', url: AppService.meta.api_root + 'files'}).success(function(data, status, headers, httpconfig) {
		if( !data.error ) {
			files.length = 0;
			files.push.apply(files, data.items);
		}
	}).error(function(data, status, headers, httpconfig) {

	});
	
	var get_file = function(id) {
		var defer = $q.defer();
		$http({method: 'GET', url: AppService.meta.api_root + 'file/' + id}).success(function(data, status, headers, httpconfig) {
			if( !data.error ) {
				defer.resolve({item: data.item});
			} else {
				defer.reject({error: "FileNotFound"});	
			}
		}).error(function(data, status, headers, httpconfig) {
			defer.reject({error: "HttpCommuError"});	
		});
		return defer.promise;
	};
	
	var get_file_raw_url = function(id, name) {
		var url = AppService.meta.root_url + AppService.meta.api_root + "file/" + id + "/raw";
		if(name)
			url += '/' +  encodeURIComponent(name);
		return url;
	};
	
	var get_file_download_url = function(id, name) {
		var url = AppService.meta.root_url + AppService.meta.api_root + "file/" + id + "/download";
		if(name)
			url += '/' +  encodeURIComponent(name);
		return url;
	};
	
	// return relative url
	var get_files_list_url = function(condition) {
		condition = condition || {};
		var url = "files";
		var params = $.param(condition).replace(/\+/g, "%20"); // workaround
		if( params )
			url += '?' + params;
		return url;
	};
	
	var get_files_list_tag_url = function(tagname) {
		return get_files_list_url({tags: tagname});
	};
	
	var get_files = function(condition) {
		var defer = $q.defer();
		var url = get_files_list_url(condition);
		$http({method: 'GET', url: AppService.meta.api_root + url}).success(function(data, status) {
			if( !data.error ) {
				defer.resolve(data);
			} else {
				defer.reject(data);
			}
		}).error(function(data, status) {
			defer.reject(data);
		});
		return defer.promise;
	};
	
	FileService.files = files;
	FileService.meta = meta;
	FileService.get_file = get_file;
	FileService.get_file_raw_url = get_file_raw_url;
	FileService.get_file_download_url = get_file_download_url;
	FileService.get_files_list_url = get_files_list_url;
	FileService.get_files_list_tag_url = get_files_list_tag_url;
	FileService.get_files = get_files;
	
	return FileService;
	
});

app.factory('NoteService', function($q, $http, AppService, APIService) {
	var NoteService = {};
	
	return NoteService;
});

