
app.controller("AppController", function($scope, $state, $modal, $location, $window, $element, $translate, $compile, AppService) {

	$scope.config = AppService.config;
	$scope.meta = AppService.meta;

	$scope.titleTranslateIds = {
		'File' : 'FILE_LABEL',
	};
	
	$scope.signIn = function() {
		location.href='auth/google';	
	};
	
	$scope.signOut = function() {
		location.href='logout';	
	};
	
	$scope.isStateActive = function (state) {
		return $state.current.name.startsWith(state);
	};
	
	$scope.title = function() {
		var title = '';
		if( $state.current.title != 'Dashboard' ) {
			var transactionId = $scope.titleTranslateIds[$state.current.title] || $state.current.title;
			if( transactionId )
				title += $translate(transactionId, $scope.meta.pageParams);
		}
		if( title )
			title += ' | ';
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
				disqus_pane.html('<div disqus="meta.disqusId"></div>');//The dynamically loaded data
				$compile(disqus_pane.contents())($scope);
			}
		}
	});

});

app.controller("NavibarController", function($scope, $state, $location, FileService) {

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

app.controller("FilesController", function($scope, $stateParams, $location, FileService) {
	$scope.files = [];
	$scope.condition = $stateParams;
	
	$scope.default_per_page = 20;
	$scope.per_page = $stateParams.limit || $scope.default_per_page;
	$scope.current_page = Math.floor( ($stateParams.skip || 0) / $scope.per_page) + 1;
	$scope.count_all = $scope.current_page * $scope.per_page;
	
	$scope.get_tag_url = FileService.get_files_list_tag_url;
	
	var load_files = function() {
		var query = angular.copy($scope.condition);
		query.limit = $scope.per_page;
		query.skip = ($scope.current_page - 1 ) * $scope.per_page;
		console.log("query ", query);
		var result = FileService.query(query, function(error, data) {
			if( error )
				return;
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
		$scope.files = result.items;
		if( result.count_all )
			$scope.count_all = result.count_all;

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

app.controller("FileController", function($modal, $scope, $state, $window, $stateParams, $location, FileService, AppService) {

	$scope.get_raw_url = FileService.get_raw_url;
	$scope.get_download_url = FileService.get_download_url;

	$scope.file = FileService.get($stateParams.id);
	
	$scope.get_tag_url = FileService.get_files_list_tag_url;

	$scope.preview_type = function() {
		if( !$scope.file.mime )
			return "";
		if(
			$scope.file.mime == "image/jpeg" ||
			$scope.file.mime == "image/png" ||
			$scope.file.mime == "image/gif" ||
			$scope.file.mime == "image/bmp" ||
			$scope.file.mime == "image/svg+xml" ||
			$scope.file.mime == "image/x-icon"
		)
			return "image";
		if( $scope.file.mime == 'application/pdf' )
			return 'pdf';
		return '';
	};

	$scope.$watch('file.name', function(filename) {
		$scope.meta.pageParams.filename = filename;
	});
});

app.controller("DashboardController", function($scope, $stateParams, FileService) {

	$scope.get_tag_url = FileService.get_files_list_tag_url;
	
	$scope.files = FileService.query({sort: "modified", order: -1, limit: 10}).items;
});

app.controller("NotesController", function($scope, $stateParams, NoteService) {

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


});

app.controller("PDFViewController", function($scope, PDFViewerService) {
	
	$scope.init = function(src) {
		$scope.pdfsrc = src;
	};
	
	$scope.currentPage = 1;
	$scope.totalPages = 1;
	
	$scope.viewer = PDFViewerService.Instance("pdf-viewer");

	$scope.nextPage = function() {
		$scope.viewer.nextPage();
	};

	$scope.prevPage = function() {
		$scope.viewer.prevPage();
	};

	$scope.loadedPage = function(curPage, totalPages) {
		$scope.currentPage = curPage;
		$scope.totalPages = totalPages;
	};
});
