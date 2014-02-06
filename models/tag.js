
var mongoose = require('mongoose');

var tag_scheme = new mongoose.Schema({
	name:  String,
	canonical: String,
	note: String,
});

module.exports = tag_scheme;
