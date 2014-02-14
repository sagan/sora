
var path = require('path');
var fs = require('fs');

var config = require('../config');
var auth = require('./auth');

var appMainFile = path.resolve(__dirname, '../public/templates/index.html');
(function() {
	if( config.disableAppcache ) {
		var appMainFileNoCache = path.resolve(__dirname, '../tmp/index-noappcache.html');
		fs.writeFileSync( appMainFileNoCache, fs.readFileSync(appMainFile, {encoding: 'utf8'}).replace('manifest="/app.appcache" ', '') );
		appMainFile = appMainFileNoCache; 
	}
})();

var appRoute = function(req, res) {
	res.sendfile( appMainFile );
};

var onlineRoute = function(req, res){
	res.send(204);
};

var initConfigRoute = function(req, res) {
	res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
	var initConfig = {};
	initConfig.locale = req.locale;

	var content = '<script type="text/javascript">';
	content += 'window.sora=' +  JSON.stringify(initConfig) + ';';
	content += '</script>';

	res.send(content);
};

var bind_routers = function(app, prefix) {
	app.get('/', appRoute);
	app.get("/tags", appRoute);
	app.get("/files", appRoute);
	app.get("/notes", appRoute);
	app.get("/config", appRoute);
	app.get("/help", appRoute);
	app.get("/about", appRoute);
	app.get("/dashboard", appRoute);
	app.get("/files/:id", appRoute);
	
	app.get('/init', initConfigRoute);

	app.get(prefix + 'config', function(req, res){
		res.json({
			locale: req.locale,
			site_name: config.site_name,
			site_tagline: config.site_tagline,
			site_description: config.site_description,
			admin_name: config.admin_name,
			admin_url: config.admin_url,
			disqus_shortname: config.disqus_shortname,
			version: config.version,
			disableAppcache: config.disableAppcache,
			env: config.env,
			user: req.user,
			userRole: auth.userRole(req.user),
		});
	});
	app.get(prefix + 'online', onlineRoute);
};

exports.bind_routers = bind_routers;

