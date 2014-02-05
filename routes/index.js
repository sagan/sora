
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.config = function(req, res){
  res.json(GLOBAL.config);
};