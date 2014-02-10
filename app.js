
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
var manifest = require('./package.json');
var database = require('./database');
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
	var tag_controller = require('./controllers/tag');
	var file_controller = require('./controllers/file');

	var app_route = function(req, res) {
		res.sendfile(__dirname + '/public/templates/index.html');
	};
	app.get('/', app_route);
	app.get("/tags", app_route);
	app.get("/files", app_route);
	app.get("/notes", app_route);
	app.get("/config", app_route);
	app.get("/help", app_route);
	app.get("/about", app_route);
	app.get("/dashboard", app_route);
	app.get("/file/:id", app_route);
	
	app.get('/api/config', function(req, res){
		res.json({
			locale: req.locale,
			site_name: config.site_name,
			site_tagline: config.site_tagline,
			site_description: config.site_description,
			admin_name: config.admin_name,
			admin_url: config.admin_url,
			disqus_shortname: config.disqus_shortname,
			version: manifest.version,
			env: app.get('env'),
		});
	});
	app.get('/api/online', function(req, res){
		res.send(204);
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
