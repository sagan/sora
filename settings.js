
exports.init = function(app) {
	var path = require('path');
		
	var mainConfig = require('./config');
	
	// sanitize user config
	if( mainConfig.env ) {
		if( mainConfig.env == 'dev' )
			mainConfig.env = 'development';
		else if( mainConfig.env == 'product' ) 
			mainConfig.env = 'production';
	}
	
	if( mainConfig.adminGoogleAccount ) {
		if( mainConfig.adminGoogleAccount.indexOf('@') == -1 ) {
			mainConfig.adminGoogleAccount += '@gmail.com';
		}
	}
	
	if( mainConfig.siteUrl ) {
		if( mainConfig.siteUrl[mainConfig.siteUrl.length - 1] != '/' ) {
			mainConfig.siteUrl += '/';
		}
	}


	// load default config
	var config = {};
	
	config.version = require('./package.json').version;
	config.site_name = 'Sora';
	config.site_tagline = 'version ' + config.version;
	config.site_description = 'powered by Sora Project \n\n' +
	  '[Github](https://github.com/sagan/sora)';
	config.siteUrl = '';
	config.admin_name = 'Admin';
	config.admin_url = 'http://';
	config.adminGoogleAccount = '';
	config.mongodb_link = 'mongodb://localhost/sora';
	config.secretToken = 'your secret here';
	config.libraries = {
		'default': {path: '/tmp'},
	};
	config.libraryControlFileName = '.sora.json';
	config.disableAppcache = false;
	config.env = 'development';
	config.server_ip = '0.0.0.0';
	config.server_port = 3000;
	config.server_ssl = false;
	config.server_ssl_cert = '';
	config.server_ssl_key = '';
	config.disqus_shortname = '';
	config.prerender_token = '';
	
	for(var k in config) {
		if( typeof mainConfig[k] == 'undefined' )
			mainConfig[k] = config[k];
	}
	console.log(mainConfig);
	
	
	// configure app
	var express = require('express');
	var helmet = require('helmet');
	var locale = require('locale');
	var passport = require('passport');
	var GoogleStrategy = require('passport-google').Strategy;
	var MongoStore = require('connect-mongo')(express);
	
	app.set('env', mainConfig.env);
	
	var supported = ['en', 'ja', 'zh_CN', 'zh_TW'];
	app.use(locale(supported));
	
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// helmet security policy
	app.use(helmet.xframe());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.hsts()); // HTTP Strict Transport Security
	
	app.use(express.cookieParser(mainConfig.secretToken));
	app.use(express.session( {store: new MongoStore({
		url: mainConfig.mongodb_link + '/sessions',
	}), cookie: {
		maxAge: 10 * 365 * 86400 * 1000,	
	}}));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use("/components", express.static(path.join(__dirname, 'bower_components')));
	
	if( mainConfig.prerender_token )
		app.use(require('prerender-node')).set('prerenderToken', mainConfig.prerender_token);
		
	app.use(passport.initialize());
	app.use(passport.session());
	
	// Authentication using passsport
	passport.use(new GoogleStrategy({
		returnURL: mainConfig.siteUrl + 'auth/google/return',
		realm: mainConfig.siteUrl
  }, function(identifier, profile, done) {
  	console.log( 'logining', identifier, profile );
		done(null, {
			email: profile.emails[0].value,
			name: profile.displayName
		});
	}));
	
	passport.serializeUser(function(user, done) {
		done(null, JSON.stringify(user));
	});

	passport.deserializeUser(function(userstring, done) {
		done(null, JSON.parse(userstring));
	});
	
	app.get('/auth/google', passport.authenticate('google'));
	app.get('/auth/google/return', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' }));
	
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	app.configure('development', function(){
		app.use(express.errorHandler());
	});
	
};
