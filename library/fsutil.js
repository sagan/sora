
var crypto = require('crypto');
var fs = require('fs');


var hash_file = function(file) {
	var algo = "sha1";
	var callback = console.log;

	if( arguments.length == 2 ) {
		if( typeof arguments[1] == "string" )
			algo = arguments[1];
		else // should be a function
			callback = arguments[1];
	} else if( arguments.length == 3 ) {
		if( typeof arguments[1] == "string" ) {
			algo = arguments[1];
			callback = arguments[2];
		} else { // should be a function
			callback = arguments[1];
			algo = arguments[2];
		}
	}

	var shasum = crypto.createHash(algo);

	var s = fs.ReadStream(file);
	s.on('data', function(d) { shasum.update(d); });
	s.on('end', function() {
		var d = shasum.digest('hex');
		//lowercase string hash result
		//console.log(d);
		callback(null, d);
	});
	s.on('error', function(e) {
		callback("StreamError");	
	});
};

exports.hash_file = hash_file;

