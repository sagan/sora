
app.factory('AppService', function($rootScope, $q, $location, $http) {
	var AppService = {};
	
	var config = {};
	var meta = {
		loaded: false
	};
	
	meta.root_url = $location.protocol() + '://' +  $location.host() + ($location.port() != ( $location.protocol() == "http" ? 80 : 443 ) ? ':' + $location.port() : '') + $("base").attr("href");
	meta.api_root = "api/";
	
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if( current.$$route )
			meta.page_title = current.$$route.title;
			meta.page_id = $location.path();
	});
	
	$http({method: 'GET', url: meta.api_root + 'config'}).success(function(data, status, headers, httpconfig) {
		angular.copy(data, config);
		if( !config.site_tagline )
			config.site_tagline = "version " + config.version;
		window.disqus_shortname = config.disqus_shortname;
		meta.loaded = true;
	}).error(function(data, status, headers, config) {

	});

	AppService.config = config;
	AppService.meta = meta;
	
	return AppService;
	
});

app.factory('TagService', function($q, $http, AppService) {
	var TagService = {};
	
	var config = AppService.config;
	
	var tags = [];
	
	var colors = ["red", "blue", "cyan", "green", "yellow", "gray"];
	
	var process_tag_colors = function() {
		for(var i =0; i < tags.length; i++) {
			var index = Math.floor(Math.random() * (colors.length - 1 - 0 + 1) + 0);
			tags[i].color = colors[index];
		}
	};
	
	$http({method: 'GET', url: AppService.meta.api_root + 'tags'}).success(function(data, status, headers, httpconfig) {
		if( !data.error ) {
			tags.push.apply(tags, data.items);
			process_tag_colors();
		}
	}).error(function(data, status, headers, httpconfig) {

	});
	
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
