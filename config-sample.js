
/*
 *
 *  Sora sample config.js file
 *
 *  You must create the config file before this Sora app will work.
 *  create the Sora config file from this sample file:
 *    cp config-sample.js config.js
 *  then edit the config.js file at your needs.
 *  For advanced user: You could also use the "config.json" as config file if you like. ( You can use either at your wish, but not both. )
 *
 *  Note if you modify the config file after the app has started, The app will need to restart to make changes take effect.
 *
 */

var config = {};

module.exports = config;

/* start editing from here */

// your site name
config.site_name = 'Sora';

// a single line text about your site, will be displayed as your site's sub head title
config.site_tagline = '願いが叶う場所';

/*
 * a piece of text about your site, will be displayed in your site homepage by default.
 * support markdown format.
 */
config.site_description = 'powered by Sora Project \n\n' +
  '[Github](https://github.com/sagan/sora)';
  
/**
 * set it to your site root url
 * Like: 'http://example.com/'
 * change example.com to your site domain. If you are using SSL, change http to https.
 * 
 * If you do not provide this value, some functions will not be working. (like "Sign in with Google" function)
 * 
 */
config.siteUrl = '';

/*
 * The administrator (site owner) display name.
 */
config.admin_name = 'Admin';

/*
 * The administrator's homepage URL, will be displayed on site.
 */
config.admin_url = 'http://';

/*
 * The administrator's google account (gmail address) 
 * Format: 'example@gmail.com'
 * Sora will use it to automatically identify admin when logging in with this Google account.
 *
 * Currently we only support logging in using 'Google' account.
 * Which need your server has a public internet connection.
 *
 */
config.adminGoogleAccount = '';

/*
 * The mongodb database connection link.
 */
config.mongodb_link = 'mongodb://localhost/sora';

/*
 * The libraries path where your files are located in.
 * Sora will watch this path and index all files in it.
 *
 * format: name -> path
 *
 */
config.libraries = {
	'default': {path: '/tmp'},
};

/*
 * The library path where your files are located in.
 * Sora will watch this path and index all files in it.
 */
config.library_path = '/tmp';

/**
 * a secret string used in session
 */
config.secretToken = 'your secret here';

/*
 * running environment of your site app.
 * set it to "development" or "production"
 * In "development" environment, the debug functions will be enabled and some features (like cache) may be disabled.
 *
 * default value is "development"
 */
config.env = 'development';

/* 
 * in which port should your site server listening on ?
 * You may want set it to 80 or 443 (if SSL enabled, see below) in production environment.
 *
 * default value is 3000
 */
config.server_port = 80;

/*
 * which ip should your site server listening on ?
 *
 * default value is 0.0.0.0 (means listening on all available ethnet addresses)
 */
//config.server_ip = '0.0.0.0';

/*
 * whether your site are using SSL / TLS ?
 *
 * default value is false
 */
//config.server_ssl = false;

/*
 * If you are using SSL, set it to your ssl cert file path ( cert file should include any intermediate cert )
 */
//config.server_ssl_cert = '/path/to/your/ssl/cert.pem';

/*
 * if you are using SSL, set it to your ssl key file path.
 */
//config.server_ssl_key = '/path/to/your/ssl/key.pem';

/*
 * if you are using disqus, uncomment it and set it to your site's disqus shortname
 *
 */
//config.disqus_shortname = '';

/*
 * if you are using prerender.io, uncomment it and set it to your prerender token.
 * prerender.io is a service that let ajax site crawlable by search engines
 */
//config.prerender_token = '';

/**
 * The config file name of library
 * Will be created in every dir in library
 * Note this file must be started with dot ('.') char
 *
 * default value is ".sora.json"
 */ 
//config.libraryControlFileName = '.sora.json';

/**
 * Disable offline cache.
 *
 * default value is false
 */
//config.disableAppcache = false;

/**
 * Google OAuth2.0 Client ID / Secret
 * generate yours at https://code.google.com/apis/console/b/0/
 */
//config.googleClientId = '';
//config.googleClientSecret = '';

