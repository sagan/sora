
var path = require('path');
var mongoose = require('mongoose');
var config = require('../config');
var db = mongoose.connection;
var File = db.model('File');
var checkAuthorize = require('./auth').checkAuthorize;

var query = function(req, res, next) {
	var condition = {};
	if( req.query.tags ) {
		if( typeof req.query.tags == 'string' )
			condition.tags = req.query.tags.split(/,\s*/);
		else //array
			condition.tags = req.query.tags;
	}
	if( req.query.search )
		condition.search = req.query.search;
	
	var skip = req.query.skip || 0;
	var limit = req.query.limit || 20;
	var sort = {};
	sort[req.query.sort || 'modified'] = req.query.order || -1;
		
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
		condition = File.buildQuery(condition);
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
};

var get = function(req, res, next) {
	File.findOne({_id: req.params.id}, function(err, file) {
		if (err || !file) {
			console.log(err);
			return res.send(503);
		}
		return res.json({item: file});
	});
};

var getBySha1 = function(req, res, next) {
	File.findOne({sha1: req.params.sha1}, function(err, file) {
		if (err || !file) {
			console.log(err);
			return res.send(404);
		}
		return res.sendfile(path.join(config.library_path, file.path, file.name));
	});
};

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
		return res.sendfile(path.join(config.library_path, file.path, file.name));
	});
};

var download_file = function(req, res, next) {
	var sendheader = 'attachment;';
	res.set("Content-Disposition", sendheader);
	return raw_file(req, res, next);
};

var bind_routers = function(app, prefix) {
	app.get(prefix + 'files/:id', checkAuthorize('public'), get);
	app.get(prefix + 'files', checkAuthorize('public'), query);
	//app.post(prefix + 'file/:id', checkAuthorize('admin'), save);
	//app.delete(prefix + 'file/:id', checkAuthorize('admin'), remove);
	
	app.get('/:sha1([a-f0-9]{40})', checkAuthorize('public'), getBySha1);
	app.get('/:id([a-f0-9]{24})', checkAuthorize('public'), raw_file);
	app.get(prefix + 'files/:id/raw', checkAuthorize('public'), raw_file);
	app.get(prefix + 'files/:id/raw/*', checkAuthorize('public'), raw_file);
	app.get(prefix + 'files/:id/download', checkAuthorize('public'), download_file);
	app.get(prefix + 'files/:id/download/*', checkAuthorize('public'), download_file);
};

exports.bind_routers = bind_routers;
