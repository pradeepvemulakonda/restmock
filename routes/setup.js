const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const basepath = req.app.get('basepath');
  res.render('upload.pug', { title: 'restmock', basepath: basepath });
});

module.exports = router;
 