
// a wrapper for fs for security
//

var fs = require('fs');
var path = require('path');

var FS = {};

FS.readFile = function() {
	return fs.readFile.apply(fs, arguments);
}

FS.readdir = function() {
	return fs.readdir.apply(fs, arguments);
}

FS.realpath = function() {
	return fs.realpath.apply(fs, arguments);
}

FS.watch = function() {
	return fs.watch.apply(fs, arguments);
}

FS.stat = function() {
	return fs.stat.apply(fs, arguments);
}

FS.lstat = function() {
	return fs.lstat.apply(fs, arguments);
}

FS.writeFile = function(filename) {
	var basename = path.basename( filename );
	if( basename.substr(0, 1) != '.' ) //for now, only allow writing to file which filename starting with "."
		throw new Error('For security reason, write attempt to ' + filename + 'is denied.');
	return fs.writeFile.apply(fs, arguments);
};

module.exports = FS;

