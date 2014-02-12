
app.factory('AppService', function($rootScope, $q, $location, $http, $window, localStorageService, $angularCacheFactory) {
	var AppService = {};

	var CacheWrapper = function(storageName, options) {
		this._cache = $angularCacheFactory(storageName, options);		
	};
	CacheWrapper.prototype.get = function(key, default_value, callback) {
		var value = this._cache.get(key);
		if( typeof value == 'undefined' ) {
			value = ( typeof default_value == 'undefined' ? {} : default_value );
			this._cache.put(key, value);
		}
		return value;
	};
	CacheWrapper.prototype.update = function(key, value, callback) {
		var old_value = this._cache.get(key);
		if( typeof old_value == 'undefined' ) {
			this._cache.put(key, value);
		} else {
			angular.copy(value, old_value);
		}

	};

	// permanant localstorage app data that sync with server automatically
	// do not impose a limit but should only storage a small count of data
	var data = new CacheWrapper('dataCache', {
		storageMode: 'localStorage',
	});
	//window.data = data; // debug

	// mongodb storage is a **cache** which means has limit
	// query ob mongodb objectid (_id)
	var storage = new CacheWrapper('storageCache', {
		capacity: 1000,
		//storageMode: 'localStorage',
	});
	
	var config = data.get('config');
	
	var meta = {
		loaded: false,
		online: true,
		page_title: "",
		pageParams: {}, // updated by ng-view controller 
	};
	
	meta.root_url = $location.protocol() + '://' +  $location.host() + ($location.port() != ( $location.protocol() == "http" ? 80 : 443 ) ? ':' + $location.port() : '') + $("base").attr("href");
	meta.api_root = "api/";
	
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if( current.$$route )
			meta.page_title = current.$$route.title;
		meta.page_id = $location.path();
		if( config.env == 'development' && !config.disableAppcache ) {
			$window.applicationCache.update(); // Attempt to update the user's cache.
		}
	});
	
	$http({method: 'GET', url: meta.api_root + 'config'}).success(function(result, status, headers, httpconfig) {
		data.update('config', result);
		if( !config.site_tagline )
			config.site_tagline = "version " + config.version;
		$window.disqus_shortname = config.disqus_shortname;
		meta.loaded = true;
	}).error(function(result, status, headers, config) {
		console.log("ajax get config error");
	});

	AppService.config = config;
	AppService.meta = meta;
	AppService.data = data;
	AppService.storage = storage;
	
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
					$window.location.reload();
				} else {
					// just download new app cache but do not activate it now
					$window.applicationCache.swapCache();
				}
			} else {
				// Manifest didn't changed. Nothing new to server.
			}
		}, false);
	}, false);
	
	return AppService;
	
});

app.factory('TagService', function($q, $http, AppService) {
	var TagService = {};
	
	var config = AppService.config;
	var data = AppService.data;
	var meta = AppService.meta;
	
	var colors = ["red", "blue", "cyan", "green", "yellow", "gray"];
	var process_tag_colors = function() {
		for(var i =0; i < tags.length; i++) {
			var index = Math.floor(Math.random() * (colors.length - 1 - 0 + 1) + 0);
			tags[i]._color = colors[index];
		}
	};
	
	var tags = data.get('tags', []);
	// shuffle tag color every time page loads.
	process_tag_colors();

	var query = function(option, callback) {
		callback = callback || angular.noop;
		$http({method: 'GET', url: meta.api_root + 'tags'}).success(function(result, status, headers, httpconfig) {
			if( !data.error ) {
				tags.length = 0;
				tags.push.apply(tags, result.items);
				process_tag_colors();
				callback(null, tags);
			} else {
				callback(1);
			}
		}).error(function(result, status, headers, httpconfig) {
			callback(1);
		});
		
		return tags;
	};
	
	query();
	
	TagService.query = query;
	TagService.tags = tags;

	return TagService;
	
});

app.factory('FileService', function($q, $http, AppService) {
	var FileService = {};
	
	var config = AppService.config;
	var storage = AppService.storage;
	var data = AppService.data;
	var meta = AppService.meta;

	var get_raw_url = function(file) {
		var url = meta.root_url + meta.api_root + "files/" + file._id + "/raw";
		url += '/' +  encodeURIComponent(file.name);
		return url;
	};
	
	var get_download_url = function(file) {
		var url = meta.root_url + meta.api_root + "files/" + file._id + "/download";
		url += '/' +  encodeURIComponent(file.name);
		return url;
	};
 	
	var get = function(id, callback) {
		callback = callback || angular.noop;
		
		$http({method: 'GET', url: meta.api_root + 'files/' + id}).success(function(result, status, headers, httpconfig) {
			if( !result.error ) {
				storage.update(id, result.item);
				callback(null, storage.get(id));
			} else {
				callack(1);
			}
		}).error(function(result, status, headers, httpconfig) {
			callback(1);
		});
		
		return storage.get(id); 
	};

	// return relative url
	var get_files_list_url = function(condition) {
		condition = condition || {};
		var url = "files";
		var params = $.param(condition);
		if( params )
			url += '?' + params;
		return url;
	};
	
	var get_files_list_tag_url = function(tagname) {
		return get_files_list_url({tags: tagname});
	};

	var query = function(condition, callback) {
		callback = callback || angular.noop;

		var url = get_files_list_url(condition);

		var lists = data.get('lists'); 

		var query_result = {
			items: [],
		};

		if( lists[url] ) {
			for(var j = 0; j < lists[url].items.length; j++ ) {
				query_result.items.push(storage.get(lists[url].items[j]));
			}
			query_result.count_all = lists[url].count_all;
		}

		$http({method: 'GET', url: AppService.meta.api_root + url}).success(function(result, status) {
			if( !result.error ) {
				lists[url] = {
					items: [],
				};
				query_result.items.length = 0;
				for(var i = 0; i < result.items.length; i++) {
					storage.update(result.items[i]._id, result.items[i]);
					query_result.items.push(storage.get(result.items[i]._id));
					lists[url].items.push(result.items[i]._id);
				}
				query_result.count_all = result.count_all;
				lists[url].count_all = result.count_all;

				callback(null, query_result);
			} else {
				callback(1);
			}
		}).error(function(result, status) {
			callback(1);
		});
		
		console.log(query_result);
		return query_result;
	};
	
	FileService.get = get;
	FileService.query = query;
	FileService.get_raw_url = get_raw_url;
	FileService.get_download_url = get_download_url;
	FileService.get_files_list_url = get_files_list_url;
	FileService.get_files_list_tag_url = get_files_list_tag_url;
	
	return FileService;
	
});

app.factory('NoteService', function($q, $http, AppService) {
	var NoteService = {};

	var config = AppService.config;
	var storage = AppService.storage;
	var data = AppService.data;
	var meta = AppService.meta;


	var get = function(id, callback) {
		callback = callback || angular.noop;
		
		$http({method: 'GET', url: meta.api_root + 'notes/' + id}).success(function(result, status, headers, httpconfig) {
			if( !result.error ) {
				storage.update(id, result.item);
				callback(null, storage.get(id));
			} else {
				callack(1);
			}
		}).error(function(result, status, headers, httpconfig) {
			callback(1);
		});
		
		return storage.get(id);
	};

	var query = function(condition, callback) {
		callback = callback || angular.noop;
		condition = condition || {};

		var url = 'notes' + '?' + $.param(condition);

		var lists = data.get('lists'); 

		var query_result = {
			items: [],
		};

		if( lists[url] ) {
			for(var j = 0; j < lists[url].items.length; j++ ) {
				query_result.items.push(storage.get(lists[url].items[j]));
			}
			query_result.count_all = lists[url].count_all;
		}

		$http({method: 'GET', url: meta.api_root + url}).success(function(result, status) {
			if( !result.error ) {
				lists[url] = {
					items: [],
				};
				query_result.items.length = 0;
				for(var i = 0; i < result.items.length; i++) {
					storage.update(result.items[i]._id, result.items[i]);
					query_result.items.push(storage.get(result.items[i]._id));
					lists[url].items.push(result.items[i]._id);
				}
				query_result.count_all = result.count_all;
				lists[url].count_all = result.count_all;

				callback(null, query_result);
			} else {
				callback(1);
			}
		}).error(function(result, status) {
			callback(1);
		});
		
		console.log(query_result);
		return query_result;

	};

	NoteService.get = get;
	NoteService.query = query;

	return NoteService;
});

