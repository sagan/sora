
var mongoose = require('mongoose');

var file_scheme = new mongoose.Schema({
	name:  String,
	sha1:  String,
	modified:  Date,
	path:  String,
	database:  String,
	mime:  String,
	size:  Number,
	note: String,
});

module.exports = file_scheme;
