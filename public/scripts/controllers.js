
app.controller("AppController", function($scope, $modal, $location, $window, $element, $translate, AppService) {

	$scope.config = AppService.config;
	$scope.meta = AppService.meta;
	
	$scope.title = function() {
		var title = "";
		if( $scope.meta.page_title != "" )
			title += $translate($scope.meta.page_title) + " | "; 
		title += $scope.config.sitename;
		return title;
	};
	
	$scope.$watch("config.locale", function() {
		$translate.uses($scope.config.locale);
	});
});

app.controller("NavibarController", function($scope, $location, FileService) {
	$scope.isActive = function (viewLocation) {
		return viewLocation === $location.path();
	};
	
	$scope.search = function() {
		console.log( FileService.get_files_list_url({search: $scope.keyword}) );
		$location.path("files");
		$location.search("search", $scope.keyword);
	};
});

app.controller("TagsController", function($scope, TagService, FileService) {
	$scope.tags = TagService.tags;
	
	$scope.get_tag_url = function(tagname) {
		return FileService.get_files_list_url({tags: tagname});
	};
	
});

app.controller("FilesController", function($scope, $routeParams, FileService) {
	$scope.condition = $routeParams;

	$scope.get_tag_url = function(tagname) {
		return FileService.get_files_list_url({tags: tagname});
	};
	
	FileService.get_files($scope.condition).then(function(data) {
		$scope.files = data.items;
	});
});

app.controller("FileController", function($modal, $scope, $window, $routeParams, $location, FileService) {
		
	$scope.id = $routeParams.id;

	$scope.download = function() {
		$window.open($scope.raw_url);
	};
	
	FileService.get_file( $scope.id ).then(function(result) {
		if( !result.error ) {
			$scope.file = result.item;
			FileService.get_file_raw($scope.id, $scope.file.name).then(function(url) {
				$scope.raw_url = url;
			});
		}
	});
});