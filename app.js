
/**
 * Module dependencies.
 */

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();

var config = require('./config');
require('./settings').init(app);

require('./database').init(function() {
	require('./library').init(app);
	require('./controllers').init(app);
	
	if( config.server_ssl ) {
		https.createServer({
			key: fs.readFileSync(config.server_ssl_key),
			cert: fs.readFileSync(config.server_ssl_cert)
		}, app).listen(config.server_port, config.server_ip, function(){
			console.log("Express server (ssl) listening on port " + config.server_port + ", ip " + config.server_ip);
		});
	} else {
		http.createServer(app).listen(config.server_port, config.server_ip, function(){
			console.log("Express server listening on port " + config.server_port + ", ip " + config.server_ip);
		});
	}
	
});
