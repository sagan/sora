
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var locale = require('locale');
var config = require('./config');
var manifest = require('./package.json');
var database = require('./database');
var app = express();

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
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.use("/components", express.static(path.join(__dirname, 'bower_components')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var start_app = function() {
	var tag_controller = require('./controllers/tag');
	var file_controller = require('./controllers/file');

	var app_route = function(req, res) {
		res.render('index');
	};
	app.get('/', app_route);
	app.get("/tags", app_route);
	app.get("/files", app_route);
	app.get("/config", app_route);
	app.get("/help", app_route);
	app.get("/about", app_route);
	app.get("/dashboard", app_route);
	app.get("/file/:id", app_route);
	
	app.get('/api/config', function(req, res){
		res.json({
			locale: req.locale,
			site_name: config.site_name,
			site_description: config.site_description,
			admin_name: config.admin_name,
			admin_url: config.admin_url,
			version: manifest.version,
		});
	});
	app.get("/api/tags", tag_controller.get_tags);
	app.get("/api/files", file_controller.get_files);
	app.get("/api/file/:id", file_controller.get_file);
	app.get("/api/file/:id/raw", file_controller.raw_file);
	app.get("/api/file/:id/raw/*", file_controller.raw_file);
	app.get("/api/file/:id/download", file_controller.download_file);
	app.get("/api/file/:id/download/*", file_controller.download_file);
	
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
