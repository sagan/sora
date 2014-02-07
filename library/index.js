
var fs = require('fs');
var async = require('async');
var path = require('path');
var util = require('util');
var mongoose = require('mongoose');
var db = mongoose.connection;

var config = require('../config');

var Tag = db.model('Tag');
var File = db.model('File');
var Files = db.collection("files");
var Tags = db.collection("tags");

var process_file = function(file, stats, tags) {
	var relative_path = path.relative(config.library_path, file);
	console.log("process_file " + relative_path);
	
	var filesegs = relative_path.split(path.sep);
	var filename = filesegs.pop();
	var file_tags = filesegs;
	
	File.findOne({path: relative_path}, function(err, item) {
		if( !item ) {
			Files.insert({name: filename, path: relative_path, size: stats.size, modified: stats.mtime, tags: file_tags}, function(err) {
				
			});
		}
	});
	
	for(var i = 0; i < file_tags.length; i++) {
		if( tags.indexOf(file_tags[i]) == -1 ) {
			tags.push(file_tags[i]);
		}
	}
};

var scan_dir = function(dir, tags, result_callback) {
	fs.readdir(dir, function(err, files) {
		if(err) {
			result_callback(-1);
			return;
		}
		async.eachLimit(files, 3, function(file, callback){
			var filename = path.join(dir, file);
			fs.stat(filename, function(err, stats) {
				if( err ) {
					console.log(err);
					callback();
					return;
				}
				if( stats.isDirectory() ) {
					scan_dir(filename, tags, function() {
						callback();
					});
				} else if( stats.isFile()) {
					process_file(filename, stats, tags);
					callback();
				} else {
					callback(); // not a dir or a regular file, just skip it.
				}
			});
		}, function(err) {
			result_callback(err);
		});
	});
};

var process_tags = function(tags) {
	async.eachLimit(tags, 3, function(tag, callback){
		Tag.findOne({name: tag}, function(err, item) {
			if( !item ) {
				Tags.insert({name: tag}, function(err) {
				
				});	
			}
		});
		callback();
	}, function(err) {
		
	});
};

var scan = function(callback) {
	console.log("scan dir " + config.library_path);
	var tags = [];
	scan_dir( config.library_path, tags, function() {
		console.log("scan dir complete " + config.library_path);
		console.log(tags);
		process_tags(tags);
		callback();
	});
};

var daemon_running = false;

var daemon = function() {
	if( daemon_running )
		return -1;
	daemon_running = true;
	scan(function(err) {
		daemon_running = false;
	});
};

var start_daemon = function() {
	//setInterval(daemon, 30000);
	daemon();
};

exports.scan = scan;
exports.daemon = daemon;
exports.start_daemon = start_daemon;
