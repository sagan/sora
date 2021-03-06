
exports.init = function(app) {
	var mainController = require('./main');
	var tagController = require('./tag');
	var fileController = require('./file');
	var noteController = require('./note');
	var adminController = require('./admin');
	
	var api_root = '/api/';
	
	fileController.bind_routers(app, api_root);
	tagController.bind_routers(app, api_root);
	noteController.bind_routers(app, api_root);
	adminController.bind_routers(app, api_root);
	mainController.bind_routers(app, api_root);
		
};
