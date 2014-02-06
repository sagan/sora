
var mongoose = require('mongoose');

var conn = mongoose.connection;
var tag_scheme = require('../models/tag');
var Tag = conn.model('Tag', tag_scheme);

var get_tags = function(req, res, next) {
  Tag.find(function(err, tags) {
		if (err) {
			console.log(err);
			return res.json({error: 1});
		}
		return res.json({items: tags});
	});
}

exports.get_tags = get_tags;
