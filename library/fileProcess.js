
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


var process = function(relative_path, stats, library, resultCallback) {
	console.log("process_file " + relative_path);
	
	var filepath = path.dirname(relative_path);
	var filename = path.basename(relative_path);
	var fileDirTags = getFileDirTags(relative_path, stats);
	var fileAbsPath  = path.join(config.libraries[library].path, relative_path);
	var fileHash = '';
	var fileSaved = null;

	var hash = function(callback) {
		fsutil.hashFile(fileAbsPath, function(err, sha1) {
			if( err ) {
				callback('hash file error');
			} else {
				fileHash = sha1;
				callback(null);
			}
		});
	};

	var save = function(callback) {
		File.findOne({path: filepath, name: filename, library: library}, function(err, item) {
			var get_new_file = function(old) {
				var file = old || new File({path: filepath, name: filename, library: library});
				file.size = stats.size;
				file.modified = new Date();
				file.mtime = stats.mtime;
				file._deleted = null;

				if( fileHash )
					file.sha1 = fileHash;

				file.dirTags = fileDirTags;
				file.staticTags = file.staticTags || [];
				file.tags = [];
				file.tags.push.apply(file.tags, file.dirTags);
				file.tags.push.apply(file.tags, file.staticTags);

				file.mime = mime.lookup(filename);
				file.scheme_version = database.SCHEME_VERSION_FILE;

				file._deleted = false;
				return file;
			};
			var toSaveFile;
			if( !item ) {
				toSaveFile = get_new_file();
			} else {
				toSaveFile = get_new_file(item);
			}
			toSaveFile.save(function(err, saved) {
				fileSaved = saved;
				callback(err);
			});
		});
	};
	

	async.series([hash, save], function(err) {
		console.log('process file save', err);
		resultCallback(err, {id: fileSaved._id, item: fileSaved});	
	});

};


exports.process = process;

