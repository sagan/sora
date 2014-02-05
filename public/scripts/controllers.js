
app.controller("AppController", function($scope, $modal, $location, $window, $element, AppService) {
	$scope.title = AppService.title;
	
	$scope.config = AppService.config;
});