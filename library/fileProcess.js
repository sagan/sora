
var fs = require('./fs');
var async = require('async');
var path = require('path');
var util = require('util');
var mongoose = require('mongoose');
var mime = require('mime');
var db = mongoose.connection;

var fsutil = require('./fsutil');
var config = require('../config');
var database = require('../database');

var Tag = db.model('Tag');
var File = db.model('File');

var getFileDirTags = function(relative_path, stats) {
	var filepath = path.dirname(relative_path);
	if( filepath == '.' )
		return [];
	return filepath.split(path.sep);
};


var process = function(relative_path, stats, library, callback) {
	console.log("process_file " + relative_path);
	
	var filepath = path.dirname(relative_path);
	var filename = path.basename(relative_path);
	var fileDirTags = getFileDirTags(relative_path, stats);

	File.findOne({path: filepath, name: filename, library: library}, function(err, item) {
		var get_new_file = function(old) {
			var file = old || new File({path: filepath, name: filename, library: library});
			file.size = stats.size;
			file.modified = new Date();
			file.mtime = stats.mtime;

			file.dirTags = fileDirTags;
			file.staticTags = file.staticTags || [];
			file.tags = [];
			file.tags.push.apply(file.tags, file.dirTags);
			file.tags.push.apply(file.tags, file.staticTags);

			file.mime = mime.lookup(filename);
			file.scheme_version = database.SCHEME_VERSION_FILE;
			return file;
		};
		if( !item ) {
			var create_file = get_new_file();
			create_file.save(function(err, saved) {
				callback(err, {id: saved._id, item: saved});
			});
		} else {
			var new_file = get_new_file(item);
			new_file.save(function(err, saved) {
				callback(err, {id: saved._id, item: saved});
			});
		}
	});
	

};


exports.process = process;

