
var fs = require('./fs');
var async = require('async');
var path = require('path');
var util = require('util');
var mongoose = require('mongoose');
var mime = require('mime');
var db = mongoose.connection;

var fsutil = require('./fsutil');
var config = require('../config');
var database = require('../database');

var Tag = db.model('Tag');
var File = db.model('File');
var Files = db.collection("files");
var Tags = db.collection("tags");

var getFileTags = function(file, stats) {
	var relative_path = path.relative(config.library_path, file);
	var filepath = path.dirname(relative_path);
	if( filepath == '.' )
		return [];
	return filepath.split(path.sep);
};

var process_file = function(file, stats, tags, callback) {
	var relative_path = path.relative(config.library_path, file);
	console.log("process_file " + relative_path);
	
	var filepath = path.dirname(relative_path);
	var filename = path.basename(relative_path);
	var fileTags = getFileTags(file, stats);
	
	for(var i = 0; i < fileTags.length; i++) {
		if( tags.indexOf(fileTags[i]) == -1 ) {
			tags.push(fileTags[i]);
		}
	}

	File.findOne({path: filepath, name: filename}, function(err, item) {
		var get_new_file = function(old) {
			var file = old || new File({path: filepath, name: filename});
			file.size = stats.size;
			file.modified = stats.mtime;
			file.tags = fileTags;
			file.mime = mime.lookup(filename);
			file.scheme_version = database.SCHEME_VERSION_FILE;
			return file;
		};
		if( !item ) {
			var create_file = get_new_file();
			create_file.save(function(err, saved) {
				callback(err, {id: saved._id});
			});
		} else {
			var new_file = get_new_file(item);
			new_file.save(function(err, saved) {
				callback(err, {id: saved._id});
			});
		}
	});
	

};

var scan_dir = function(dir, tags, result_callback, options) {

	options = options || {};
	
	var dirMetaFile = path.join(dir, config.libraryControlFileName);
	var dirMeta;
	var dirStats;
	var dirChanged = true;
	var dirFiles = {};
	var dirChangedFiles = {};
	var dirDeletedFiles = {};
	var dirSubDirs = {};
	
	var readDirMeta = function(serieCallback) {
		fs.readFile(dirMetaFile, {encoding: 'utf8'}, function(err, filecontent) {
			if(err || options.fullRescan) {
				dirMeta = {
					files: {},
				};
			} else {
				dirMeta = JSON.parse(filecontent);
			}

			fs.lstat(dir, function(err, stats) {
				dirStats = stats;	
				serieCallback(dirMeta.noindex || err);
			});
		});
	};
	
	var readDirFiles = function(serieCallback) {
		fs.readdir(dir, function(err, files) {
			if(err) {
				serieCallback('ReadDirFileError');
				return;
			}

			if( dirMeta.modified && ( new Date(dirMeta.modified) ).getTime() >= dirStats.mtime.getTime() ) {
				dirChanged = false;
			} 

			async.eachLimit(files, 3, function(file, callback){
				var filename = path.join(dir, file);
				fs.lstat(filename, function(err, stats) {
					if( err ) {
						console.log(err);
						callback();
						return;
					}
					if( stats.isDirectory() ) {
						dirSubDirs[file] = {stats: stats};
						callback();
					} else if( stats.isFile()) {
						if( dirChanged ) {
							if(path.extname(file) != '' && file.substr(0, 1) != '.')
								dirFiles[file] = {stats: stats};
						}
						callback();
					} else {
						callback(); // not a dir or a regular file, just skip it.
					}
				});
			}, function(err) {
				serieCallback();
			});
		});
	};
	
	var processFiles = function(serieCallback) {
		if( !dirChanged ) {
			console.log( dir + ' unchanged, skip');
			serieCallback();
			return;
		}

		for(var name in dirFiles) {
			if(	!dirMeta.files[name] || !dirMeta.files[name].modified ) {
				dirChangedFiles[name] = dirFiles[name];
			} else {
				var oldFileModifiedTime = new Date( dirMeta.files[name].modified );
				if( oldFileModifiedTime.getTime() < dirFiles[name].stats.mtime.getTime() ) {
					dirChangedFiles[name] = dirFiles[name];
				}
			}
		}
		
		for(var name in dirMeta.files) {
			if( !dirFiles[name] ) {
				dirDeletedFiles[name] = dirMeta.files[name];
			}
		}
		
		async.forEach(Object.keys(dirChangedFiles), function(name, callback){
			process_file(path.join(dir, name), dirChangedFiles[name].stats, tags, function(err, result) {
					if( ! dirMeta.files[name] )
						dirMeta.files[name] = {};
					dirMeta.files[name].modified = dirChangedFiles[name].stats.mtime;
					dirMeta.files[name].id = result.id;
					callback();
			});
		}, function() {
			serieCallback();
		});
		
	};
	
	var cleanDeletedFiles = function(serieCallback) {
		async.forEach(Object.keys(dirDeletedFiles), function(name, callback){
			File.remove({_id: dirDeletedFiles[name].id}, function(err) {
				delete dirMeta.files[name];
				callback();
			});
		}, function() {
			serieCallback();
		});
	};
	
	var processSubDirs = function(serieCallback) {
		if( options.recursive ) {
			async.forEach(Object.keys(dirSubDirs), function(name, callback){
					scan_dir(path.join(dir, name), tags, function() {
						callback();
					}, options);
			}, function() {
				serieCallback();
			});
		} else {
			serieCallback();
		}
	};
	
	var updateDirMetaFile = function(serieCallback) {
		if( dirChanged || Object.keys(dirChangedFiles).length != 0 || Object.keys(dirDeletedFiles) != 0) {
			if( dirChanged )
				dirMeta.modified = dirStats.mtime;
			fs.writeFile(dirMetaFile, JSON.stringify(dirMeta), function(err) {
				serieCallback(err);
			})
		} else {
			serieCallback();
		}
	};
	
	async.series([readDirMeta, readDirFiles, processFiles, cleanDeletedFiles, processSubDirs, updateDirMetaFile], function(err) {
		result_callback(err);
	});

};

var process_tags = function(tags) {
	async.eachLimit(tags, 3, function(tag, callback){
		Tag.findOne({name: tag}, function(err, item) {
			var get_new_tag = function(old) {
				var new_tag = old || new Tag({name: tag});
				new_tag.scheme_version = database.SCHEME_VERSION_TAG;
				return new_tag;
			};
			if( !item ) {
				var create_tag = get_new_tag();
				create_tag.save(function(err) {
				
				});
			} else {
				item.scheme_version = item.scheme_version || 0;
				if(item.scheme_version < database.SCHEME_VERSION_TAG ) {
					var new_tag = get_new_tag(item);
					new_tag.save(function(err) {
				
					});
				}
			}
		});
		callback();
	}, function(err) {
		
	});
};

var scan = function(callback) {
	console.log("scan dir " + config.library_path);
	var tags = [];
	scan_dir( config.library_path, tags, function() {
		console.log("scan dir complete " + config.library_path);
		console.log(tags);
		process_tags(tags);
		callback();
	}, {recursive: true});
};

var daemon_running = false;

var daemon = function(callback) {
	if( daemon_running )
		return -1;
	daemon_running = true;
	scan(function(err) {
		callback(err);
		daemon_running = false;
	});
};


var watchedChangingDirs = {};

var libraryChangedEventListener = function(event, filename, dirname) {
	console.log('Library change detected. ', event, filename, dirname);
	
	var tags = [];
	scan_dir(dirname, tags, function() {
		process_tags(tags);
	}, {recursive: false});
};

var fsWatches = {};
var addFsWatch = function(filepath, listener) {
	if( fsWatches[filepath] )
		return;	
	console.log('Add watch for dir ' + filepath);
	fsWatches[filepath] = {};
	fs.watch(filepath, function(event, filename) {
		if( !filename || filename.substr(0, 1) != '.' ) {
			if( watchedChangingDirs[filepath] ) {
				clearTimeout(watchedChangingDirs[filepath]);
				delete watchedChangingDirs[filepath];	
			}
			watchedChangingDirs[filepath] = setTimeout(function() {
				delete watchedChangingDirs[filepath];
				if( event == 'rename' ) {
					var chanedpath = path.join(filepath, filename);
					fs.lstat(chanedpath, function(err, stats) {
						if( !err && stats.isDirectory() && ! fsWatches[chanedpath] ) {
							// new directory created ?
							addFsWatch(chanedpath, listener);
							listener('change', '', chanedpath);
						} else {
							listener(event, filename, filepath);	
						}
					});	
				} else {
					listener(event, filename, filepath);
				}
			}, 1000);
		}
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

var init = function() {
	//setInterval(daemon, 1 * 60 * 1000);
	daemon(function() {
		setupWatches(config.library_path, libraryChangedEventListener, function() {
			console.log('setup fs watches complete');
		});
	});
};

exports.init = init;

