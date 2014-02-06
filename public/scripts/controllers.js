
app.controller("AppController", function($scope, $modal, $location, $window, $element, $translate, AppService) {
	$scope.title = AppService.title;
	$scope.config = AppService.config;
	
	$scope.$watch("config.locale", function() {
		$translate.uses($scope.config.locale);
	});
});

app.controller("NavibarController", function($scope, $location) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
});

app.controller("TagsController", function($scope, TagService) {
	$scope.tags = TagService.tags;
});

app.controller("FilesController", function($scope, FileService) {
	$scope.files = FileService.files;
});

app.controller("FileController", function($modal, $scope, $window, $routeParams, $location, FileService) {

	$scope.id = $routeParams.id;
	
	$scope.download = function() {
		FileService.get_file_raw($scope.id).then(function(url) {
			$window.open(url);
		});
	};
	
	FileService.get_file( $scope.id ).then(function(result) {
		if( !result.error ) {
			$scope.file = result.item;	
		}	
	});
});