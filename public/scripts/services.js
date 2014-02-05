
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
	
	$http({method: 'GET', url: '/config'}).success(function(data, status, headers, httpconfig) {
		angular.copy(data, config);
	}).error(function(data, status, headers, config) {

	});
	
	AppService.title = title;
	AppService.config = config;
	
	return AppService;
	
});