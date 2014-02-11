
'use strict';

var app = angular.module("app", [
	'ui.bootstrap', 'ngRoute',
	'ngAnimate',
	'hljs',
	'pascalprecht.translate',
	'ngClipboard',
	'ngDisqus',
	'LocalStorageModule',
	'jmdobry.angular-cache',
	'angular-markdown',
])
.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
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
	}).when('/files/:id', {
		title: "File",
		templateUrl: 'templates/file.html'
	}).when('/about', {
		title: "About",
		templateUrl: 'templates/about.html'
	}).when('/help', {
		title: "Help",
		templateUrl: 'templates/help.html'
	}).otherwise({redirectTo: '/'});
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
}).run(function() {

	// fix jQuery.param space encoding bug
	// temporary
	// http://stackoverflow.com/questions/5804872/overriding-the-jquery-param-function
	
/*
    (function($){

var buildParams = function( prefix, obj, traditional, add ) {
        var name;

        if ( jQuery.isArray( obj ) ) {
                // Serialize array item.
                jQuery.each( obj, function( i, v ) {
                        if ( traditional || rbracket.test( prefix ) ) {
                                // Treat each array item as a scalar.
                                add( prefix, v );

                        } else {
                                // Item is non-scalar (array or object), encode its numeric index.
                                buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
                        }
                });

        } else if ( !traditional && jQuery.type( obj ) === "object" ) {
                // Serialize object item.
                for ( name in obj ) {
                        buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
                }

        } else {
                // Serialize scalar item.
                add( prefix, obj );
        }
};
        $.param = function( a, traditional ) {
            console.log('custom $.param');
            var s = [],
                add = function( key, value ) {
                    // If value is a function, invoke it and return its value
                    value = jQuery.isFunction( value ) ? value() : value;
                    s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
                };

            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if ( traditional === undefined ) {
                traditional = jQuery.ajaxSettings.traditional;
            }

            // If an array was passed in, assume that it is an array of form elements.
            if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
                // Serialize the form elements
                jQuery.each( a, function() {
                    add( this.name, this.value );
                } );

            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for ( var prefix in a ) {
                    buildParams( prefix, a[ prefix ], traditional, add );
                }
            }
            return s.join("&");
            // Return the resulting serialization
            //return s.join( "&" ).replace( r20, "+" );
        };
    })(jQuery);
*/

	(function($){
		$._param = $.param; 
		$.param = function(a) {
			return $._param(a).replace(/\+/g, '%20');
		};
	})(jQuery);


});
