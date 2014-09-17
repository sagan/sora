
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
    var config = require('./default-config');;
	for(var k in config) {
		if( typeof mainConfig[k] == 'undefined' )
			mainConfig[k] = config[k];
	}
	console.log(mainConfig);
	
	
	// configure app
	var express = require('express');
    var session = require('express-session');
    var favicon = require('serve-favicon');
    var bodyParser = require('body-parser');
    var morgan = require('morgan'); // former express logger middleware
	var helmet = require('helmet');
	var locale = require('locale');
	var passport = require('passport');
    var cookieParser = require('cookie-parser');
    var errorHandler = require('error-handler');
    var methodOverride = require('method-override');
    var serveStatic = require('serve-static');
	var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
	var MongoStore = require('connect-mongo')(session);
	
	app.set('env', mainConfig.env);
	
	var supported = ['en', 'ja', 'zh_CN', 'zh_TW'];
	app.use(locale(supported));
	
	app.use(favicon(__dirname + '/public/favicon.ico'));
	app.use(morgan('dev'));
	app.use(bodyParser());
	app.use(methodOverride());

	// helmet security policy
	app.use(helmet.xframe());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.hsts()); // HTTP Strict Transport Security
	
	app.use(cookieParser());
	app.use(session({
        secret: 'test',
        store: new MongoStore({
		    db: 'sessions',
        }),
    }));

	app.use(serveStatic(path.join(__dirname, 'public')));
	app.use("/components", serveStatic(path.join(__dirname, 'bower_components')));
	
	if( mainConfig.prerender_token )
		app.use(require('prerender-node')).set('prerenderToken', mainConfig.prerender_token);
		
	app.use(passport.initialize());
	app.use(passport.session());
	
	// Authentication using passsport
	passport.use(new GoogleStrategy({
        clientID: mainConfig.googleClientId,
        clientSecret: mainConfig.googleClientSecret,
        callbackURL: mainConfig.siteUrl + 'auth/google/callback',
    }, function(accessToken, refreshToken, profile, done) {
  	    console.log( 'logining', arguments );
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
	
	app.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/userinfo.email'}));
	app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/' }));
	
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

    var env = process.env.NODE_ENV || 'development';
    if ('development' == env) {
        app.use(errorHandler);
    }
};

