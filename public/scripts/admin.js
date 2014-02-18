
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

app.controller('AdminNoteEditController', ['$scope', '$q', '$stateParams', 'AdminService', 'NoteService', function($scope, $q, $stateParams, AdminService, NoteService) {
	
	$scope.appConfig = AdminService.getAppConfig();

	$scope.saved = function() {
		return angular.equals($scope.note, $scope.editNote, true);
	};

	$scope.editNote = {tags: []};

	$scope.note = $stateParams.id ? NoteService.get($stateParams.id, function(err, note) {
		$scope.editNote = angular.copy($scope.note);
	}) : {tags: []};


	$scope.save = function() {
		NoteService.createOrUpdate($scope.editNote, function(err, updatedNote) {
			if( !err ) {
				$scope.note = updatedNote;
				$scope.editNote = angular.copy(updatedNote);
			}
		});
	};

	$scope.tags = ["a", "b"];
	$scope.getTagClass = function(tag) {
		return 'label label-info';
	};
	
}]);

app.controller('AdminNotesController', ['$scope', '$q', '$stateParams', 'AdminService', 'NoteService', function($scope, $q, $stateParams, AdminService, NoteService) {
	
	$scope.appConfig = AdminService.getAppConfig();

	$scope.condition = {};

	$scope.perPage = 20;
	$scope.currentPage = 1;
	$scope.countAll = 0;
	

	$scope.changeCurrentNote = function(index) {
		$scope.currentNote = $scope.notes[index];
	};

	var loadNotesList = function() {
		var query = angular.copy($scope.condition);
		query.limit = $scope.perPage;
		query.skip = ( $scope.currentPage - 1 ) * $scope.perPage;
		var query_result = NoteService.query(query, function() {
			$scope.countAll = query_result.count_all;
			$scope.changeCurrentNote(0);
		});
		$scope.notes = query_result.items;
		$scope.countAll = query_result.count_all;
		$scope.changeCurrentNote(0);
	};

	$scope.$watch("currentPage", loadNotesList);


	
}]);

