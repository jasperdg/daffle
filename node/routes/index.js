var express = require('express');
var router = express.Router();
var web3 = require('web3');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(web3);
  res.json({ message: 'This should return no view ffs' });
});

module.exports = router;
