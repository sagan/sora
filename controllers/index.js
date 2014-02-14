
exports.init = function(app) {
	var mainController = require('./main');
	var tagController = require('./tag');
	var fileController = require('./file');
	var noteController = require('./note');
	
	var api_root = '/api/';
	
	mainController.bind_routers(app, api_root);
	fileController.bind_routers(app, api_root);
	tagController.bind_routers(app, api_root);
	noteController.bind_routers(app, api_root);
	
};
