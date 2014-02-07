
var path = require('path');
var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');
var db = mongoose.connection;
var config = require('../config');

var file_scheme = require('../models/file');
file_scheme.plugin(textSearch);
file_scheme.index({ name: 'text' });
var File = db.model('File', file_scheme);

var get_files = function(req, res, next) {
	var condition = {};
	if( req.query.tags )
		condition.tags = req.query.tags;
	if( req.query.search )
		condition.search = req.query.search;
	
	var skip = req.query.skip || 0;
	var limit = req.query.limit || 20;
	var sort = {};
	sort[req.query.sort || 'name'] = req.query.order || 1;
		
	if( condition.search ) {
		File.textSearch(condition.search, function(err, output) {
			console.log(output);
			if (err) {
				console.log(err);
				return res.json({error: 1});
			}
			var files = [];
			for(var i = 0; i < output.results.length; i++) {
				files.push(output.results[i].obj);
			}
			return res.json({items: files});
		});
	} else {
		File.count(condition, function(err, count) {
			File.find(condition).sort(sort).skip(skip).limit(limit).exec(function(err, files) {
				if (err) {
					console.log(err);
					return res.json({error: 1});
				}
				return res.json({items: files, count_all: count});
			});
		});
	}
}

var get_file = function(req, res, next) {
  File.find({_id: req.params.id}, function(err, files) {
		if (err) {
			console.log(err);
			return res.json({error: 1});
		}
		return res.json({item: files[0]});
	});
}

var raw_file = function(req, res, next) {
  File.find({_id: req.params.id}, function(err, files) {
		if (err) {
			console.log(err);
			return res.send(404, 'File Not Found');
		}
		var file = files[0];
		if( !file.path ) {
			return res.send(403, 'File Not Available');
		}
		var sendheader = 'attachment;';
		// unfortunately the filename do not support non ASCII chars.
		//sendheader += ' filename=' + file.name;
		res.set("Content-Disposition", sendheader);
		return res.sendfile(path.join(config.library_path, file.path));
	});
}

exports.get_files = get_files;
exports.get_file = get_file;
exports.raw_file = raw_file;
