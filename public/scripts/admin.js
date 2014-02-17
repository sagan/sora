
app.factory('AdminService', ['$http', '$q', 'AppService', function($http, $q, AppService) {
	var admin = {};
	
	var meta = AppService.meta;
	
	var appConfig = {};
	
	var getAppConfig = function(callback) {
		callback = callback || angular.noop;
		$http({method: 'GET', url: meta.api_root + 'admin/config'}).success(function(result) {
			angular.copy(result, appConfig);
			callback(null, appConfig);
		}).error(function() {
			callback(1);
		});
		return appConfig;
	};
	
	var getServerStatus = function(callback) {
		var status = {};
		callback = callback || angular.noop;
		$http({method: 'GET', url: meta.api_root + 'admin/status'}).success(function(result) {
			angular.copy(result, status);
			callback(null, status);
		}).error(function() {
			callback(1);
		});
		return status;
	};
	
	admin.getAppConfig = getAppConfig;
	admin.getServerStatus = getServerStatus;
	
	return admin;
	
}]);

app.controller('AdminController', ['$scope', '$q', '$state', '$stateParams', 'AdminService', function($scope, $q, $state, $stateParams, AdminService) {

}]);

app.controller('AdminDashboardController', ['$scope', '$q', '$stateParams', 'AdminService', function($scope, $q, $stateParams, AdminService) {
	$scope.serverStatus = AdminService.getServerStatus();
	
	$scope.refresh = function() {
		$scope.serverStatus = AdminService.getServerStatus();
	};
}]);

app.controller('AdminSystemController', ['$scope', '$q', 'AdminService', function($scope, $q, AdminService) {
	
}]);

app.controller('AdminConfigController', ['$scope', '$q', 'AdminService', function($scope, $q, AdminService) {
	
	$scope.appConfig = AdminService.getAppConfig();
	
}]);

app.controller('AdminNotesController', ['$scope', '$q', 'AdminService', 'NoteService', function($scope, $q, AdminService, NoteService) {
	
	$scope.appConfig = AdminService.getAppConfig();

	$scope.createNote = function() {
		NoteService.create({title: 'xxx', content: 'sfsdfdsf'});
	};
	
}]);

