
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var locale = require("locale");
var config = require("./config");
var tag_controller = require("./controllers/tag");
var file_controller = require("./controllers/file");
var app = express();
var supported = ["en", "ja", "zh_CN", "zh_TW"];

mongoose.connect(config.mongodb_link);
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

app.get('/', function(req, res) {
	res.render('index');
});
app.get('/config', function(req, res){
	res.json({
		locale: req.locale,
		sitename: config.sitename,
	});
});
app.get("/tags", tag_controller.get_tags);
app.get("/files", file_controller.get_files);
app.get("/file/:id", file_controller.get_file);
app.get("/file/:id/raw", file_controller.raw_file);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
