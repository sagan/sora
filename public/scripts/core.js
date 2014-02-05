
'use strict';

var app = angular.module("app", ['ui.bootstrap', 'ngRoute', 'ngAnimate', 'hljs']).config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/dashboard', {
		title: "Dashboard",
		templateUrl: 'templates/dashboard.html'
	}).otherwise({redirectTo: '/dashboard'});
	$locationProvider.html5Mode(false);
})
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
