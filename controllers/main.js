
var path = require('path');
var fs = require('fs');

var config = require('../config');
var manifest = require('../package.json');

var appMainFile = path.resolve(__dirname, '../public/templates/index.html');
if( config.disableAppcache ) {
	var appMainFileNoCache = path.resolve(__dirname, '../temp/index-noappcache.html');
	fs.writeFileSync( appMainFileNoCache, fs.readFileSync(appMainFile, {encoding: 'utf8'}).replace('manifest="/app.appcache" ', '') );
	appMainFile = appMainFileNoCache; 
}

var app_route = function(req, res) {
	res.sendfile( appMainFile );
};

var online_route = function(req, res){
	res.send(204);
};

var bind_routers = function(app, prefix) {
	app.get('/', app_route);
	app.get("/tags", app_route);
	app.get("/files", app_route);
	app.get("/notes", app_route);
	app.get("/config", app_route);
	app.get("/help", app_route);
	app.get("/about", app_route);
	app.get("/dashboard", app_route);
	app.get("/files/:id", app_route);
	
	app.get(prefix + 'config', function(req, res){
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
	app.get(prefix + 'online', online_route);
};

exports.bind_routers = bind_routers;

