
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

note_scheme.statics.buildQuery = function (condition) {
	var query = {};
	if( condition.tags ) {
		if( typeof condition.tags == 'string' )
			var tags = [condition.tags];
		else if ( Array.isArray(condition.tags) ) {
			var tags = condition.tags;
		}
		query.tags = {'$all': query.tags.sort(function(a, b) {
			return b.length - a.length;
		})};
	}
	
	return query;
};

module.exports = note_scheme;
