
'use strict';

var app = angular.module("app", ['ui.bootstrap', 'ngRoute', 'ngAnimate', 'hljs', 'pascalprecht.translate']).config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/dashboard', {
		title: "Dashboard",
		templateUrl: 'templates/dashboard.html'
	}).when('/config', {
		title: "Config",
		templateUrl: 'templates/config.html'
	}).when('/tags', {
		title: "Tags",
		templateUrl: 'templates/tags.html'
	}).when('/files', {
		title: "Files",
		templateUrl: 'templates/files.html'
	}).when('/file/:id', {
		title: "File",
		templateUrl: 'templates/file.html'
	}).when('/help', {
		title: "Help",
		templateUrl: 'templates/help.html'
	}).otherwise({redirectTo: '/dashboard'});
	$locationProvider.html5Mode(false);
})
.config(['$translateProvider', function($translateProvider) {
	$translateProvider.translations('en', en);
	$translateProvider.translations('ja', ja);
	$translateProvider.translations('zh_CN', zh_CN);
	$translateProvider.translations('zh_TW', zh_TW);
	$translateProvider.preferredLanguage('en');
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
