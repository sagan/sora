
'use strict';

var app = angular.module("app", [
	'ui.bootstrap',
	'ui.router',
	'ngAnimate',
	'hljs',
	'pascalprecht.translate',
	'ngClipboard',
	'ngDisqus',
	'LocalStorageModule',
	'jmdobry.angular-cache',
	'angular-markdown',
	'ngPDFViewer',
	'ui.gravatar',
])
.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
		
	$locationProvider.html5Mode(true).hashPrefix('!');
	$urlRouterProvider.otherwise("/");
	
	$stateProvider.state('dashboard', {
		title: "Dashboard",
		url: "/",
		templateUrl: 'templates/dashboard.html'
	}).state('config', {
		title: "Config",
		url: "/config",
		templateUrl: 'templates/config.html'
	}).state('tags', {
		title: "Tags",
		url: "/tags",
		templateUrl: 'templates/tags.html'
	}).state('files', {
		title: "Files",
		url: "/files?limit&tags&skip",
		templateUrl: 'templates/files.html'
	}).state('notes', {
		title: "Notes",
		url: "/notes",
		templateUrl: 'templates/notes.html'
	}).state('admin', { // admin state and sub states
		title: "Control Panel",
		url: "/admin",
		abstract: true,
		templateUrl: 'templates/admin.html'
	}).state('admin.dashboard', {
		title: "Control Panel",
		url: "/dashboard",
		templateUrl: 'templates/admin.dashboard.html'
	}).state('admin.system', {
		title: "Control Panel",
		url: "/system",
		templateUrl: 'templates/admin.system.html'
	}).state('admin.config', {
		title: "Control Panel",
		url: "/config",
		templateUrl: 'templates/admin.config.html'
	}).state('files/:id', {
		title: "File",
		url: "/files/:id",
		templateUrl: 'templates/file.html'
	}).state('about', {
		title: "About",
		url: "/about",
		templateUrl: 'templates/about.html'
	}).state('help', {
		title: "Help",
		url: "/help",
		templateUrl: 'templates/help.html'
	});

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
.config([
  'gravatarServiceProvider', function(gravatarServiceProvider) {
    gravatarServiceProvider.defaults = {
      size     : 100,
      "default": 'mm'  // Mystery man as default for missing avatars
    };

    // Use https endpoint
    gravatarServiceProvider.secure = (location.protocol == 'https:');
  }
])
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

// added ECMA6 startsWith ( currently only FireFox support it)
if (typeof String.prototype.startsWith != 'function') {
	// see below for better implementation!
	String.prototype.startsWith = function (str){
		return this.indexOf(str) == 0;
	};
}

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
