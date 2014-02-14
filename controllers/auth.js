
var config = require('../config');

var authLevelAdmin = function(req, res, next) {
	if( userRole(req.user) == 'admin' ) {
		next();
	} else {
		authDeny(req, res, next);	
	}
};

var authDeny = function(req, res, next) {
	res.send(401);
};

var authDenyPage = function(req, res, next) {
	 res.redirect('/login');
};

var authPublic = function(req, res, next) {
	 next();
};

var userRole = function(user) {
	if( !user )
		return 'public';
	if( !config.adminGoogleAccount  )
		return 'user';
	if( config.adminGoogleAccount === user.email )
		return 'admin';
	return 'user';
};

exports.checkAuthorize = function(requireAccessLevel) {
	if( requireAccessLevel == 'public' )
		return authPublic;
	else if( requireAccessLevel == 'admin' )
		return authLevelAdmin;
	return authLevelAdmin;
};

exports.userRole = userRole;
