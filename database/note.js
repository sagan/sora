
var mongoose = require('mongoose');

var note_scheme = new mongoose.Schema({
	title:  String,
	scheme_version: Number,
	content: String,
	tags: [String],
	modified: Date,
	// note type: html, md, etc
	type: String,	
});

module.exports = note_scheme;
