
var path = require('path');
var mongoose = require('mongoose');
var config = require('../config');
var db = mongoose.connection;
var Note = db.model('Note');
var checkAuthorize = require('./auth').checkAuthorize;

var get = function(req, res) {
    	Note.findOne({_id: req.params.id}, function(err, note) {
		if(err || !note) {
			console.log(err);
			return res.send(503);
		}
		return res.json({item: note});
	});
};

var save = function(req, res) {
    res.send(200);
};

var create = function(req, res) {
	console.log('create note interface', req.body);
};

var query = function(req, res) {
 	var condition = {};
	if( req.query.tags ) {
		if( typeof req.query.tags == 'string' )
			condition.tags = [req.query.tags];
		else if ( Array.isArray(req.query.tags) ) {
			condition.tags = req.query.tags;
		}
	}
	if( req.query.search )
		condition.search = req.query.search;
	console.log('get param tags:', req.query.tags);
	
	var skip = req.query.skip || 0;
	var limit = req.query.limit || 20;
	var sort = {};
	sort[req.query.sort || 'modified'] = req.query.order || 1;
		
	if( condition.search ) {
		Note.textSearch(condition.search, function(err, output) {
			console.log(output);
			if (err) {
				console.log(err);
				return res.json({error: 1});
			}
			var notes = [];
			for(var i = 0; i < output.results.length; i++) {
				notes.push(output.results[i].obj);
			}
			return res.json({items: notes});
		});
	} else {
		Note.count(condition, function(err, count) {
			Note.find(condition).sort(sort).skip(skip).limit(limit).exec(function(err, notes) {
				if (err) {
					console.log(err);
					return res.json({error: 1});
				}
				return res.json({items: notes, count_all: count});
			});
		});
	}
};

var remove = function(req, res) {
    res.send(200);
};

var bind_routers = function(app, prefix) {
	app.get(prefix + 'notes/:id', checkAuthorize('public'), get);
	app.get(prefix + 'notes', checkAuthorize('public'), query);

	app.put(prefix + 'notes/:id', checkAuthorize('admin'), save);
	app.put(prefix + 'notes', checkAuthorize('admin'), create);
	app.delete(prefix + 'notes/:id', checkAuthorize('admin'), remove);
};

exports.bind_routers = bind_routers;

