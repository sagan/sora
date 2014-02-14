# fork from  akrenmair

you need have node
``` js
$ node server.js 
```

In the browser
``` js
localhost:8000/demo/index.html
```

To install with bower
``` js
bower install ng-pdfviewer
```

# ng-pdfviewer

AngularJS PDF viewer directive using pdf.js.

``` html
<button ng-click="prevPage()">&lt;</button>
<button ng-click="nextPage()">&gt;</button>
<br>
<span>{{currentPage}}/{{totalPages}}</span>
<br>
<pdfviewer src="test.pdf" on-page-load='pageLoaded(page,total)' id="viewer"></pdfviewer>
```

and in your AngularJS code:

``` js

var app = angular.module('testApp', [ 'ngPDFViewer' ]);

app.controller('TestCtrl', [ '$scope', 'PDFViewerService', function($scope, pdf) {
	$scope.viewer = pdf.Instance("viewer");

	$scope.nextPage = function() {
		$scope.viewer.nextPage();
	};

	$scope.prevPage = function() {
		$scope.viewer.prevPage();
	};

	$scope.pageLoaded = function(curPage, totalPages) {
		$scope.currentPage = curPage;
		$scope.totalPages = totalPages;
	};
}]);
```

## Requirements

* AngularJS (http://angularjs.org/)
* PDF.js (http://mozilla.github.io/pdf.js/)

### pdf.js pdf.worker.js compatibility.js  --From github.com/mozilla/pdf.js
  In order to bundle all `src/` files into two productions scripts and build the generic
  viewer, issue:

  $ node make generic

  This will generate `pdf.js` and `pdf.worker.js` in the `build/generic/build/` directory.
  Both scripts are needed but only `pdf.js` needs to be included since `pdf.worker.js` will
  be loaded by `pdf.js`. If you want to support more browsers than Firefox you'll also need
  to include `compatibility.js` from `build/generic/web/`. The PDF.js files are large and
  should be minified for production.

## Usage

Include `ng-pdfviewer.js` as JavaScript file, along with `pdf.js` and `pdf.compat.js`.

Declare `ngPDFViewer` as dependency to your module.

You can now use the `pdfviewer` tag in your HTML source.

## License

MIT. See LICENSE.md for further details.

## Author
Andreas Krennmair <ak@synflood.at>
