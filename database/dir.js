
var mongoose = require('mongoose');

var dir_scheme = new mongoose.Schema({
	path:  String, // full local file system path
	modified:  Date,
	note: String,
	tags: [String],
	scheme_version: Number,
});

module.exports = dir_scheme;

