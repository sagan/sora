
var mongoose = require('mongoose');
var db = mongoose.connection;
var checkAuthorize = require('./auth').checkAuthorize;
var config = require('../config');

var getConfig = function(req, res, next) {
	res.send(config);
};

var getStatus = function(req, res, next) {
	res.send({
		appUptime: process.uptime(),
		cwd: process.cwd(),
		appMemoryUsage: process.memoryUsage(),
		argv: process.argv,
	});
};

var bind_routers = function(app, prefix) {
	app.get(prefix + 'admin/config', checkAuthorize('admin'), getConfig);
	app.get(prefix + 'admin/status', checkAuthorize('admin'), getStatus);
};

exports.bind_routers = bind_routers;
