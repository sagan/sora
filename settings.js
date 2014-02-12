
exports.init = function(app) {
	var path = require('path');
		
	var main_config = require('./config');
	
	// sanitize user config
	if( main_config.env ) {
		if( main_config.env == 'dev' )
			main_config.env = 'development';
		else if( main_config.env == 'product' ) 
			main_config.env = 'production';
	}


	// load default config
	var config = {};
	
	config.site_name = 'Sora';
	config.site_tagline = '願いが叶う場所';
	config.site_description = 'powered by Sora Project \n\n' +
	  '[Github](https://github.com/sagan/sora)';
	config.admin_name = 'Admin';
	config.admin_url = 'http://';
	config.mongodb_link = 'mongodb://localhost/sora';
	config.secretToken = 'your secret here';
	config.library_path = '';
	config.libraryControlFileName = '.sora.json';
	config.disableAppcache = false;
	config.env = 'development';
	config.server_ip = '0.0.0.0';
	config.server_port = 3000;
	config.server_ssl = false;
	config.server_ssl_cert = '';
	config.server_ssl_key = '';
	config.disqus_shortname = '';
	config.prerender_token = '';
	config.version = require('./package.json').version;
	
	for(var k in config) {
		if( typeof main_config[k] == 'undefined' )
			main_config[k] = config[k];
	}
	console.log(main_config);
	
	
	// configure app
	var express = require('express');
	var helmet = require('helmet');
	var locale = require('locale');
	
	app.set('env', main_config.env);
	
	var supported = ['en', 'ja', 'zh_CN', 'zh_TW'];
	app.use(locale(supported));
	
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// helmet security policy
	app.use(helmet.xframe());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.hsts()); // HTTP Strict Transport Security
	
	app.use(express.cookieParser(main_config.secretToken));
	app.use(express.session());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use("/components", express.static(path.join(__dirname, 'bower_components')));
	
	if( main_config.prerender_token )
		app.use(require('prerender-node')).set('prerenderToken', main_config.prerender_token);
		
	app.configure('development', function(){
		app.use(express.errorHandler());
	});
	
}
