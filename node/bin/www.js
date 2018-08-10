
"use strict";
/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('damble-node:server');
var http = require('http');
var Tx = require('ethereumjs-tx')

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app.app);
var io = require('socket.io')(server);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var raffleTimeInSec = 10;
var contractAddress = "0x1A181f1871D4D5CBb16a20F8753d3fAB295Bf818";

// ACCOUNT STUFF
var account = "0x4AfD85AA0D3073cE8CFCAafF78056FeCb559ADE3";
var pvtKey = new Buffer("aae924e249659ee94215941c29973aa3ed266c8f0b0ee86e063f223a9dabfb32", 'hex');

var counter = raffleTimeInSec;
var countDown = setInterval(endRaffle, 1000)
function endRaffle(){
  if (counter > 0) {
    counter--;
  }

  if (counter === 0) {
    clearInterval(countDown);
    app.contractNoEvents.methods.getPartAmounts().call(function(err,res){
      if (err) {
        throw err;
      } else {
        let total = 0;
        res.forEach(value => {
          total += parseFloat(value);
        });

        if (total > 0) {
          app.contractNoEvents.methods.accountAmount().call(async function(er, res){
            console.log('accounts in raffle: ' + res)
            if (err) {
              throw err;
            } else {
              if (parseInt(res) > 1) {
                app.contractNoEvents.methods.minEthIsMet().call(async function(err, res){
                  if (err) {
                    throw err;
                  } else {
                    if (res) {

                      app.web3NoEvents.eth.getTransactionCount(account).then(_nonce => {
                        const encoded_tx = app.contractNoEvents.methods.getRandomNumber().encodeABI();
                        const rawTx = {
                            nonce: _nonce,
                            gasLimit: 3000000,
                            gasPrice: app.web3NoEvents.utils.toHex(app.web3NoEvents.utils.toWei('20', 'gwei')),
                            data: encoded_tx,
                            from: account,
                            to: contractAddress
                        }
                        let tx = new Tx(rawTx);
                        tx.sign(pvtKey);
                        let serializedTx = tx.serialize();
                        app.web3NoEvents.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, res){
                          if(err) {
                            console.log(err);
                          } 
                          io.emit("initializing", res);
                          console.log("initalizing")
                        })
                        .on('receipt', function(res){
                          console.log('getting number')
                          rePickWinner();
                          io.emit("request number", true);

                        })
                        .on('error', function(err){
                          counter = raffleTimeInSec;
                          countDown = setInterval(endRaffle, 1000);
                          console.log('signedTransactionErr', err);
                        });
                      }).catch((error) => {
                          counter = raffleTimeInSec;
                          countDown = setInterval(endRaffle, 1000);
                          console.log(error);
                      });
                    } else {
                      counter = raffleTimeInSec;
                      countDown = setInterval(endRaffle, 1000);
                    }
                  }
                });
              } else {
                counter = raffleTimeInSec;
                countDown = setInterval(endRaffle, 1000);
              }
            }
          });
        } else {
          counter = raffleTimeInSec;
          countDown = setInterval(endRaffle, 1000);
        }
      }
    });
  }
  io.emit('second passed', counter);
}


app.router.get('/time-left', function(req,res){
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.json({'time-left' : counter});
})

app.contract.events.NewRandomNumber_uint({}, function(error, event){})
.on('data', function(event){
  clearInterval(rePickWinner);
  console.log('random number got');

  app.web3NoEvents.eth.getTransactionCount(account).then(_nonce => {
    const encoded_tx = app.contractNoEvents.methods.endRaffle().encodeABI();
    const rawTx = {
        nonce: _nonce ,
        gasLimit: 3000000,
        gasPrice: app.web3NoEvents.utils.toHex(app.web3NoEvents.utils.toWei('20', 'gwei')),
        data: encoded_tx,
        from: account,
        to: contractAddress
    }

    let tx = new Tx(rawTx);
    tx.sign(pvtKey);
    let serializedTx = tx.serialize();
    app.web3NoEvents.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, res){
      if(err) {
        console.log(err);
      } 
      console.log('picking winner');
      io.emit("picking winner", res);
    })
    .on('receipt', function(res){
      counter = raffleTimeInSec;
      countDown = setInterval(endRaffle, 1000);
    })
    .on('error', function(err){
      counter = raffleTimeInSec;
      countDown = setInterval(endRaffle, 1000);

      console.log('signedTransactionErr', err);
    });
  }).catch((error) => {
      counter = raffleTimeInSec;
      countDown = setInterval(endRaffle, 1000);
      console.log(error);
  });
}).on('error', console.error);


app.contract.events.NewUser({}, function(error, event){})
.on('data', function(event){
  console.log('user addedd');
  io.emit('new user', {change: event.returnValues});
}).on('error', console.error);

app.contract.events.ProofFailed({}, function(error, event){})
.on('data', function(event){
  console.log('proof failed');
  io.emit('proof failed', true);
}).on('error', console.error);

app.contract.events.WinnerPicked({}, function(error, event){})
.on('data', function(event){
  console.log('winner picked');
  io.emit('winner picked', {change: event.returnValues});
}).on('error', console.error);

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg)
  });
})
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}