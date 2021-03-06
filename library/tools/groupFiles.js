
var fs = require('fs');
var path = require('path');
var async = require('async');
var util = require('util');

function lcs(x,y){
    var i = 0;
    var c = '';
    while(1) {
        if( i >= x.length || i >= y.length || x[i] != y[i] )
            break; 
        c += x[i];
        i++;
    }
    return c;
}


var process = function(dir, cb, _options) {
    dir = path.normalize(dir);
    _options = _options || {};
    var options = {
        filter: 'image', // only process certain type files 
        move: '', // move found file to dir: true or '.' for current dir
    };
    Object.keys(_options).forEach(function(o) {
        options[o] = _options[o];
    });

    var groups = {};
    var fileInfos = {};
    var fileList = [];

    var prepare = function(callback) {
		console.log('read dir', dir);
        fs.readdir(dir, function(err, files) {
            if( err ) {
                console.log('readdir error', err);
                callback(1);
                return;
            }
            async.each(files, function(filename, cb) {
                var file = path.join(dir, filename);
                var ext = path.extname(filename).toLowerCase();
                if( options.filter ) {
                    if( typeof options.filter == 'string' ) {
                        if( options.filter[0] == '.' ) {
                            if( ext != options.filter ) {
                                cb();
                                return;
                            }
                        } else {
                            if( options.filter == 'image' ) {
                                if( ext != '.bmp'
                                    && ext != '.jpg'
                                    && ext != '.jpeg'
                                    && ext != '.png'
                                    && ext != '.gif'
                                ) {
                                    cb();
                                    return;
                                } 
                            } 
                        } 
                    } else if( typeof options.filter == 'function' ) { 
                        if( !options.filter(filename) ) {
                            cb();
                            return;
                        }
                    }
                }
                fileList.push(filename);
                cb();
                /*
                fs.stat(file, function(err, stats) {
                    if( err || !stats.isFile() ) {
                        cb();
                        return; 
                    }
                    fileInfos[filename] = stats;
                    cb();
                }) 
                */
            }, function(err) {
                callback(); 
            }); 
        });
    };

    var group = function(callback) {
        fileList.forEach(function(filename) {
            var commons = []; 
            fileList.forEach(function(toCompareFile) {
                if( toCompareFile == filename )
                    return;
                var common = lcs(filename, toCompareFile); 
                if( common.length > 5 )
                    commons.push({f: toCompareFile, c: common});
            });
            commons.sort(function(a, b) {
                //console.log('compare:', '|' + a.c + '|', '|' + b.c + '|');
                var s = a.c, l = b.c; // shorter, longer
                var flag = false;
                if( s.length > l.length ) {
                    s = b.c;
                    l = a.c; 
                    flag = true;
                }
				if( l.indexOf(s) == 0 ) {
                    var r = l.substr(s.length);

					var parseSeries = s.match(/([\[\(]|\s*\-?\s*\d+\s*)[^\[\(\]\)]*$/i);
					if( parseSeries )
						r = parseSeries[0] + r;
                        
                    if( /^\s*\[[^\[\]]+\]/i.test(r)
						|| /^\s*\([^\(\)]+\)/i.test(r)
						|| /^\s*\-\s*\d+/i.test(r)
						) {
                        return flag ? 1 : -1;
                    }
                }
                return b.c.length - a.c.length;
            });
            if( commons.length ) {
                var common = commons[0].c.trim();

				 // 去掉末尾的 [*, (* 的半边字符串，暴力而简洁
				common = common.replace(/[\[\(][^\[\(\]\)]*$/, '');
				
				// 去掉末尾的 '- 23'
				common = common.replace(/\s*-\s*\d+\s*$/, '');
				
				// 如果前半部分是扩展名, 去掉所有之后的
				common = common.replace(/\.(mkv|rm|rmvb|mp4|3gp|wmv)[-\s\._].*$/i, '');
				
                groups[common] = groups[common] || [];
                groups[common].push(filename);
            }
        }); 
        
        callback();
    };

    var move = function(callback) {
        if( options.move ) {
            if( options.move === true )
                options.move = '.'; 
            if( options.move[0] == '.' ) // whether startsWith . or ..
                options.move = path.normalize( path.join(dir, options.move) );
            async.each(Object.keys(groups), function(group, cb) {
                fs.mkdir(path.join(options.move, group), function(e) {
                    async.each(groups[group], function(file, cb2) {
                        fs.rename(path.join(dir, file), path.join(options.move, group, file), function(err) {
                            cb2();
                        });
                    }, function(err) {
                        cb(); 
                    });
                }); 
            }, function(err) {
                callback(); 
            });
        } else {
            callback(); 
        }
    };
    async.series([prepare, group, move], function(err, results) {
        cb(err, {groups: groups});
    });

};

exports.process = process;

var main = function() {
    var argv = require('yargs').default({
        dir: '/tmp/dira',
        filter: 'image',
        dst: '',
    }).argv;
    process(argv.dir, function(err, result) {
		console.log('result groups size: ', Object.keys(result.groups).length);
        console.log('result: ', util.inspect(result));
    }, {filter: argv.filter, move: argv.dst});
};


if( !module.parent ) {
    main();
}

