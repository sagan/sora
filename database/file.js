
var mongoose = require('mongoose');

var file_scheme = new mongoose.Schema({
	name:  String,
	path:  String,
	sha1:  String,
	mtime: Date,
	ctime: Date,
	modified:  Date,
	library:  String,
	mime:  String,
	size:  Number,
	note: String,
	scheme_version: Number,
	staticTags: [String],
	dirTags: [String],
	tags: [String]
});

file_scheme.statics.buildQuery = function (condition) {
	var query = {};
	if( condition.tags ) {
		if( typeof condition.tags == 'string' )
			var tags = [condition.tags];
		else if ( Array.isArray(condition.tags) ) {
			var tags = condition.tags;
		}
		query.tags = {'$all': tags.sort(function(a, b) {
			return b.length - a.length;
		})};
	}
	//console.log(query);
	return query;
};

module.exports = file_scheme;
