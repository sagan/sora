
app.controller("AppController", function($scope, $modal, $location, $window, $element, $translate, $compile, AppService) {

	$scope.config = AppService.config;
	$scope.meta = AppService.meta;
	
	$scope.title = function() {
		var title = "";
		if( $scope.meta.page_title != "" )
			title += $translate($scope.meta.page_title) + " | "; 
		title += $scope.config.site_name;
		return title;
	};
	
	$scope.$watch("config.locale", function() {
		$translate.uses($scope.config.locale);
	});
	
	// app loaded, init
	$scope.$watch("meta.loaded", function() {
		if( $scope.meta.loaded ) {
			if( $scope.config.disqus_shortname ) {
				// disqus enabled, load it
				var disqus_pane = $('#disqus');//JQuery request for the app pane element.
				disqus_pane.html('<div disqus="meta.page_id"></div>');//The dynamically loaded data
				$compile(disqus_pane.contents())($scope);
			}
		}
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
		
	$scope.color_classes = {
		"red": "danger",
		"blue": "primary",
		"cyan": "info",
		"green": "success",
		"yellow": "warning",
		"gray": "default",
	};
		
	$scope.get_tag_url = FileService.get_files_list_tag_url;
	
});

app.controller("FilesController", function($scope, $routeParams, $location, FileService) {
	$scope.files = [];
	
	$scope.condition = $routeParams;
	
	$scope.default_per_page = 20;
	$scope.per_page = $routeParams.limit || $scope.default_per_page;
	$scope.current_page = Math.floor( ($routeParams.skip || 0) / $scope.per_page) + 1;
	$scope.count_all = $scope.current_page * $scope.per_page;
	
	$scope.get_tag_url = FileService.get_files_list_tag_url;
	
	var load_files = function() {
		var query = angular.copy($scope.condition);
		query.limit = $scope.per_page;
		query.skip = ($scope.current_page - 1 ) * $scope.per_page;
		console.log("query ", query);
		FileService.get_files(query).then(function(data) {
			$scope.files = data.items;
			$scope.count_all = data.count_all || data.items.length;
			if( $scope.files.length > $scope.per_page ) {
				$scope.per_page = $scope.files.length;
			}
			
			if( query.skip != 0 || query.limit != $scope.default_per_page ) {
				var params = $location.search();
				params.skip = query.skip;
				params.limit = query.limit;
				$location.search(params);
			} else {
				var params = $location.search();
				delete params.skip;
				delete params.limit;
				$location.search(params);
			}
		});
	};
	
	$scope.$watch("current_page", load_files);
	
	/*
	$scope.$on('$routeUpdate', function(){
		console.log("args", arguments);
		if( Object.keys($location.search()).length == 0 ) {
			$scope.current_page = 1;
			$scope.per_page = $scope.default_per_page;
		}
		load_files();	
	});
	*/
	
});

app.controller("FileController", function($modal, $scope, $window, $routeParams, $location, FileService) {
		
	$scope.id = $routeParams.id;
	
	$scope.get_tag_url = FileService.get_files_list_tag_url;

	$scope.download = function() {
		if( $scope.download_url )
			$window.open($scope.download_url);
	};
	
	$scope.raw = function() {
		if( $scope.raw_url )
			$window.open($scope.raw_url);
	};
	
	$scope.preview_type = function() {
		if( !$scope.file || !$scope.file.mime )
			return "";
		if($scope.file.mime == "image/jpeg" ||
			$scope.file.mime == "image/png" ||
			$scope.file.mime == "image/gif" ||
			$scope.file.mime == "image/bmp" ||
			$scope.file.mime == "image/svg+xml" ||
			$scope.file.mime == "image/x-icon"
		)
			return "image";
		return "";
	};
	
	FileService.get_file( $scope.id ).then(function(result) {
		if( !result.error ) {
			$scope.file = result.item;
			$scope.raw_url = FileService.get_file_raw_url($scope.id, $scope.file.name);
			$scope.download_url = FileService.get_file_download_url($scope.id, $scope.file.name);
		}
	});
});

app.controller("DashboardController", function($scope, $routeParams, FileService) {

	$scope.get_tag_url = FileService.get_files_list_tag_url;
	
	FileService.get_files({sort: "modified", order: -1, limit: 10}).then(function(data) {
		$scope.files = data.items;
	});
});
