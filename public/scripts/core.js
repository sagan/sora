
'use strict';

var app = angular.module("app", ['ui.bootstrap', 'ngRoute', 'ngAnimate', 'hljs',
	'pascalprecht.translate', 'ngClipboard', 'ngDisqus', 'LocalStorageModule', 'angular-markdown'
])
.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/dashboard', {
		title: "Dashboard",
		templateUrl: 'templates/dashboard.html'
	}).when('/config', {
		title: "Config",
		templateUrl: 'templates/config.html'
	}).when('/tags', {
		title: "Tags",
		reloadOnSearch: true,
		templateUrl: 'templates/tags.html'
	}).when('/files', {
		title: "Files",
		reloadOnSearch: true,
		templateUrl: 'templates/files.html'
	}).when('/notes', {
		title: "Notes",
		reloadOnSearch: true,
		templateUrl: 'templates/notes.html'
	}).when('/file/:id', {
		title: "File",
		templateUrl: 'templates/file.html'
	}).when('/about', {
		title: "About",
		templateUrl: 'templates/about.html'
	}).when('/help', {
		title: "Help",
		templateUrl: 'templates/help.html'
	}).otherwise({redirectTo: '/dashboard'});
	$locationProvider.html5Mode(true).hashPrefix('!');
})
.config(['$translateProvider', function($translateProvider) {
	$translateProvider.useStaticFilesLoader({
		prefix: 'scripts/i18n/',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage('en');
	$translateProvider.fallbackLanguage('en');
}])
.config(['ngClipProvider', function(ngClipProvider) {
	ngClipProvider.setPath("components/zeroclipboard/ZeroClipboard.swf");
}])
.directive('integer', function() {
	var INTEGER_REGEXP = /^\-?\d+$/;
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (INTEGER_REGEXP.test(viewValue)) {
					// it is valid
					ctrl.$setValidity('integer', true);
					return viewValue;
				} else {
					// it is invalid, return undefined (no model update)
					ctrl.$setValidity('integer', false);
					return undefined;
				}
			});
		}
	};
})
.filter('json', function() {
	return function(input, scope) {
		return JSON.stringify(input, null, "\t");
	}
});
