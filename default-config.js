
// default config
var config = {};
module.exports = config;

config.version = require('./package.json').version;

config.disableAppcache  = true;
config.libraryControlFileName = '.sora.json';

config.site_name = 'Sora';
config.site_tagline = '願いが叶う場所';
config.site_description = '在世界中心呼唤爱\n\n这里提供一些ACG资源下载, 目前主要是轻小说和Galgame剧本.' +
	'';
config.siteUrl = 'http://localhost:3000/';

config.adminGoogleAccount = '';
config.admin_name = '小野大神';
config.admin_url = 'https://oogami.name/';
config.mongodb_link = 'mongodb://localhost/sora';
config.libraries = {
	'default': {path: '/home/sagan/Dropbox/projects/sora/sora_example_data'},
};

config.env = 'development';
config.server_ip = '0.0.0.0';
config.server_port = 3000;
config.secretToken = 'test token';
config.server_ssl = false;
config.server_ssl_cert = '';
config.server_ssl_key = '';

config.disqus_shortname = '';
config.prerender_token = '';

config.googleClientId = '';
config.googleClientSecret = '';

