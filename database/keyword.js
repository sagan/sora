
var mongoose = require('mongoose');

/**
 * automatically apply tags to files / dirs based on filename and others
 */ 

var keyword_scheme = new mongoose.Schema({
	name:  String,
	tags: [String],
});

module.exports = keyword_scheme;
