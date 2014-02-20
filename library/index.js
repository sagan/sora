
var fs = require('./fs');
var async = require('async');
var path = require('path');
var util = require('util');
var mongoose = require('mongoose');
var mime = require('mime');
var db = mongoose.connection;

var config = require('../config');
var database = require('../database');
var fsutil = require('./fsutil');
var fileProcess = require('./fileProcess');

var Tag = db.model('Tag');
var File = db.model('File');
var Files = db.collection("files");
var Tags = db.collection("tags");

var scanDir = function(relativeDir, library, result_callback, options) {

	options = options || {};
	
	console.log('scan dir', relativeDir, library, options);
	var dir = path.join(config.libraries[library].path, relativeDir);
	var dirMetaFile = path.join(dir, config.libraryControlFileName);
	var dirMeta;
	var dirStats;
	var dirChanged = true;
	var dirFiles = {};
	var dirChangedFiles = {};
	var dirDeletedFiles = {};
	var dirSubDirs = {};

	var tags = []; // all tags found in current dir (and sub dir)
	
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
			fileProcess.process(path.join(relativeDir, name), dirChangedFiles[name].stats, library, function(err, result) {
					if( ! dirMeta.files[name] )
						dirMeta.files[name] = {};
					dirMeta.files[name].modified = dirChangedFiles[name].stats.mtime;
					dirMeta.files[name].id = result.id;

					for(var i = 0; i < result.item.tags.length; i++) {
						if( tags.indexOf(result.item.tags[i]) == -1 ) {
							tags.push(result.item.tags[i]);
						}
					}

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
					scanDir(path.join(relativeDir, name), library, function(err, result) {
						for(var i = 0; i < result.tags.length; i++) {
							if( tags.indexOf(result.tags[i]) == -1 ) {
								tags.push(result.tags[i]);
							}
						}
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
		result_callback(err, {tags: tags});
	});

};

var processTags = function(tags) {
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
	Object.keys(config.libraries).forEach(function(library) {
		var libraryPath = config.libraries[library].path;
		console.log("scan dir " + libraryPath);
		scanDir("", library, function(error, result) {
			console.log("scan library dir complete " + libraryPath);
			console.log(result.tags);
			processTags(result.tags);
			callback();
		}, {recursive: true});
	});
};

var daemon_running = false;
var scanAll = function(callback) {
	if( daemon_running )
		return -1;
	daemon_running = true;
	scan(function(err) {
		callback(err);
		daemon_running = false;
	});
};


var watchedChangingDirs = {};

var libraryChangedEventListener = function(event, filename, relativeDir, library) {
	console.log('Library change detected. ', event, filename, relativeDir, library);
	
	var tags = [];
	scanDir(relativeDir, library, function(err, result) {
		processTags(result.tags);
	}, {recursive: false});
};

var fsWatches = {};
var addFsWatch = function(relativeDir, library, listener) {
	var filepath = path.join(config.libraries[library].path, relativeDir);
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
					var chanedPath = path.join(relativeDir, filename);
					var changedFsPath = path.join(filepath, filename);
					fs.lstat(changedFsPath, function(err, stats) {
						if( !err && stats.isDirectory() && ! fsWatches[chanedpath] ) {
							// new directory created ?
							addFsWatch(chanedPath, library, listener);
							listener('change', '', changedPath, library);
						} else {
							listener(event, filename, relativeDir, library);
						}
					});	
				} else {
					listener(event, filename, relativeDir, library);
				}
			}, 1000);
		}
	});
};

var setupWatches =function(relativeDir, library, listener, result_callback) {
	var dir = path.join(config.libraries[library].path, relativeDir);
	fs.readdir(dir, function(err, files) {
		if( err ) {
			result_callback(err);
		} else {
			addFsWatch(relativeDir, library, libraryChangedEventListener);
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
						setupWatches(path.join(relativeDir, file), library, listener, function() {
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
	scanAll(function() {
		Object.keys(config.libraries).forEach(function(library) {
			setupWatches("", library, libraryChangedEventListener, function() {
				console.log('setup fs watches complete');
			});
		});
	});
};

exports.init = init;

