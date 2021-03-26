var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const basepath = req.app.get('basepath');
  res.render('index.pug', { title: 'restmock', basepath: basepath });
});

module.exports = router;
