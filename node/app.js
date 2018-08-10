var pvtKey = new Buffer("aae924e249659ee94215941c29973aa3ed266c8f0b0ee86e063f223a9dabfb32", 'hex');
// ETHscan api calls
//         const url = "https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=0x3d75423bb17cdc00f874e9948b288c2938facd65&startblock=0&endblock=99999999&page=1&offset=50&sort=asc&apikey=KNZWV829X95C2QBBSH9HWWP6RKDWNTZVVK";

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var router = express.Router();
var Web3 = require('web3');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var abi = require('./abi.json');
var app = express();
var account = "0x4AfD85AA0D3073cE8CFCAafF78056FeCb559ADE3";
// CONTRACT ADDRESS
var contractAddress = "0x1A181f1871D4D5CBb16a20F8753d3fAB295Bf818";

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var web3NoEvents = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));
var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
var utils = web3NoEvents.utils;
web3NoEvents.eth.defaultAccount = account;
var contractObject = {from: account, gas:3000000};
var contractNoEvents = new web3NoEvents.eth.Contract(abi, contractAddress);
var contract = new web3.eth.Contract(abi, contractAddress);

router.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', function(req, res){
  res.json({message: "Search right ahead"});
});

router.get('/balances', function(req, res){
  contractNoEvents.methods.getPartAmounts().call(contractObject, function (err, contractRes) {
      if (err) {
        throw err;
      } else {
        res.json({"response":contractRes});
      }
    });
});

router.post('/user-balance', function(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'application/json')
  contractNoEvents.methods.getUserBalance(req.body.address).call(contractObject, function (err, contractRes) {
    if (err) {
      throw err;
    } else {
      res.json({"response":contractRes});
    }
  });
});

router.get('/account-amount', function(req,res){
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  contractNoEvents.methods.accountAmount().call(contractObject, function (err, contractRes) {
    if (err) {
      throw err;
    } else {
      res.json({"response":contractRes});
    }
  });
})


app.use('/api', router);
module.exports = {contract, app, web3, contractNoEvents, web3NoEvents, router};
