
var mongoose = require('mongoose');

var file_scheme = new mongoose.Schema({
	name:  String,
	sha1:  String,
	modified:  Date,
	path:  String,
	library:  String,
	mime:  String,
	size:  Number,
	note: String,
	scheme_version: Number,
	tags: [String]
});

module.exports = file_scheme;
