
var mongoose = require('mongoose');

var file_scheme = new mongoose.Schema({
	name:  String,
	path:  String,
	sha1:  String,
	modified:  Date,
	library:  String,
	mime:  String,
	size:  Number,
	note: String,
	scheme_version: Number,
	tags: [String]
});

module.exports = file_scheme;
