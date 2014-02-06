
app.factory('AppService', function($rootScope, $q, $location, $http) {
	var AppService = {};
	
	var page_title = "";
	
	var config = {};
	
	$rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
		if( current.$$route )
			page_title = current.$$route.title;
	});
	
	var title = function() {
		var title = "";
		if( page_title != "" )
			title += page_title + " | "; 
		title += "Sora" + " " + $location.path() ;
		return title;
	};
	
	$http({method: 'GET', url: 'config'}).success(function(data, status, headers, httpconfig) {
		angular.copy(data, config);
	}).error(function(data, status, headers, config) {

	});
	
	AppService.title = title;
	AppService.config = config;
	
	return AppService;
	
});

app.factory('TagService', function($q, $http, AppService) {
	var TagService = {};
	
	var config = AppService.config;
	var tags = [];
	
	$http({method: 'GET', url: 'tags'}).success(function(data, status, headers, httpconfig) {
		if( !data.error )
			tags.push.apply(tags, data.items);
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
	
	$http({method: 'GET', url: 'files'}).success(function(data, status, headers, httpconfig) {
		if( !data.error ) {
			files.length = 0;
			files.push.apply(files, data.items);
		}
	}).error(function(data, status, headers, httpconfig) {

	});
	
	var get_file = function(id) {
		var defer = $q.defer();
		$http({method: 'GET', url: 'file/' + id}).success(function(data, status, headers, httpconfig) {
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
	
	var get_file_raw = function(id) {
		var defer = $q.defer();
		defer.resolve("file/" + id + "/raw");
		return defer.promise;
	};
	
	FileService.files = files;
	FileService.meta = meta;
	FileService.get_file = get_file;
	FileService.get_file_raw = get_file_raw;
	
	return FileService;
	
});