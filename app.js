
/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var locale = require('locale');
var config = require('./config');
var database = require('./database');
var helmet = require('helmet');
var app = express();

if( config.env ) {
	// update express env from config file
	if( config.env == 'dev' )
		config.env = 'development';
	else if( config.env == 'product' ) 
		config.env = 'production';
	app.set('env', config.env);
}

// not working in app.configure block.
var supported = ['en', 'ja', 'zh_CN', 'zh_TW'];
app.use(locale(supported));


app.configure(function(){
	app.set('port', config.server_port || process.env.PORT || 3000);
	app.set('ip', config.server_ip || "0.0.0.0");
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// helmet security policy
	app.use(helmet.xframe());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.hsts()); // HTTP Strict Transport Security
	
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use("/components", express.static(path.join(__dirname, 'bower_components')));

	if( config.prerender_token )
		app.use(require('prerender-node')).set('prerenderToken', config.prerender_token);
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var start_app = function() {
	var mainController = require('./controllers/main');
	var tagController = require('./controllers/tag');
	var fileController = require('./controllers/file');
	var noteController = require('./controllers/note');
	
	var api_root = '/api/';
	
	mainController.bind_routers(app, api_root);
	fileController.bind_routers(app, api_root);
	tagController.bind_routers(app, api_root);
	noteController.bind_routers(app, api_root);
	
	if( config.server_ssl ) {
		https.createServer({
			key: fs.readFileSync(config.server_ssl_key),
			cert: fs.readFileSync(config.server_ssl_cert)
		}, app).listen(app.get('port'), app.get('ip'), function(){
			console.log("Express server (ssl) listening on port " + app.get('port') + ", ip " + app.get('ip'));
		});
	} else {
		http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
			console.log("Express server listening on port " + app.get('port') + ", ip " + app.get('ip'));
		});
	}
};

database.init(config, function() {
	var library = require('./library');
	library.start_daemon();
	start_app();
});
