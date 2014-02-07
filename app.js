
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var locale = require('locale');
var config = require('./config');
var tag_controller = require('./controllers/tag');
var file_controller = require('./controllers/file');
var library = require('./library');
var app = express();
var supported = ['en', 'ja', 'zh_CN', 'zh_TW'];



mongoose.connect(config.mongodb_link);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	library.start_daemon();
});


app.use(locale(supported));
	
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
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
		sitename: config.sitename,
	});
});
app.get("/api/tags", tag_controller.get_tags);
app.get("/api/files", file_controller.get_files);
app.get("/api/file/:id", file_controller.get_file);
app.get("/api/file/:id/raw", file_controller.raw_file);
app.get("/api/file/:id/raw/*", file_controller.raw_file);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
