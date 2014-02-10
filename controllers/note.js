
var get = function(req, res) {
    res.json({title: 'xc', content: 'sdfdsd'});
};

var save = function(req, res) {
    res.send(200);
};

var query = function(req, res) {
    res.json([{title: 'xc', content: 'sdfdsd'}, {title: 'xc', content: 'sdfdsd'}, {title: 'xc', content: 'sdfdsd'}]);
};

var remove = function(req, res) {
    res.send(200);
};

var bind_routers = function(app, prefix) {
	app.get(prefix + '/notes/:id', get);
	app.get(prefix + '/notes', query);
	app.post(prefix + '/notes/:id', save);
	app.delete(prefix + '/notes/:id', remove);
};

exports.bind_routers = bind_routers;