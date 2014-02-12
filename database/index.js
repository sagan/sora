
var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');

var config = require('../config');

var init = function(callback) {
	mongoose.connect(config.mongodb_link);
	var db = mongoose.connection;
	
	db.on('error', function() {
		console.log('connection error:');	
		callback(1);
	});
	
	db.once('open', function() {
		// init db scheme and model
		var file_scheme = require('./file');
		file_scheme.plugin(textSearch);
		file_scheme.index({ name: 'text' });
		var File = db.model('File', file_scheme);

		var tag_scheme = require('./tag');
		var Tag = db.model('Tag', tag_scheme);

		var note_scheme = require('./note');
		note_scheme.plugin(textSearch);
		note_scheme.index({ title: 'text' });
		note_scheme.index({ content: 'text' });
	
		var Note = db.model('Note', note_scheme);

		callback();
	});
};

exports.init = init;
exports.SCHEME_VERSION_FILE = 1;
exports.SCHEME_VERSION_TAG = 1;
exports.SCHEME_VERSION_NOTE = 1;

