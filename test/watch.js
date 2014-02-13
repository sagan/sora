
var fs = require('fs');
var path = require('path');
var async = require('async');

// test watch recursively a huge HOME dir performance
//
var libraryChangedEventListener = function(event, filename, dirname) {
	console.log('Library change detected. ', event, filename, dirname);
};

var addFsWatch = function(filepath, listener) {
	console.log('Add watch for dir ' + filepath);
	fs.watch(filepath, function(event, filename) {
		if( !filename || filename.substr(0, 1) != '.' )
			listener(event, filename, filepath);
	});
};

var setupWatches =function(dir, listener, result_callback) {
	fs.readdir(dir, function(err, files) {
		if( err ) {
			result_callback(err);
		} else {
			addFsWatch(dir, libraryChangedEventListener);
			async.forEach(files, function(file, callback) {
				var filepath = path.join(dir,file);
				fs.lstat(filepath, function(err, stats) {
					if( err ) {
						callback(err);
						return;
					}

					if( !stats.isDirectory() || file.substr(0, 1) == '.' ) {
						callback();	
					} else {
						setupWatches(filepath, listener, function() {
							callback();
						});
					}
				});
			}, function(err) {
				result_callback(err);
			});	
		}
	});	
};

console.log('Watch /home');
setupWatches('/home', libraryChangedEventListener, function(err) {
	console.log('set up /home watches complete', err);	
});

