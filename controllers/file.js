
var mongoose = require('mongoose');

var conn = mongoose.connection;
var file_scheme = require('../models/file');
var File = conn.model('File', file_scheme);

var get_files = function(req, res, next) {
  File.find(function(err, files) {
		if (err) {
			console.log(err);
			return res.json({error: 1});
		}
		return res.json({items: files});
	});
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
		res.set("Content-Disposition", "attachment; filename=" + file.name);
		return res.sendfile(file.path);
	});
}

exports.get_files = get_files;
exports.get_file = get_file;
exports.raw_file = raw_file;