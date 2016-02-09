var cfg = require('config.json')('./conf.json');
var Twitter = require('node-tweet-stream');
var locationparser = require('./locationparser.js');

var tw = new Twitter({
  consumer_key: cfg.consumer_key,
  consumer_secret: cfg.consumer_secret,
  token: cfg.token,
  token_secret: cfg.token_secret
});

var express = require('express');
var app = express();
app.use(express.static('public'));

var http = require('http').Server(app);
var io = require('socket.io')(http); //change to http later

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//console.log(cfg);

tw.track('socket.io');
tw.track('#nodejs');

curtracker = '#virginiatech';

tw.track(curtracker);

tw.on('tweet', function(tweet){
  io.emit('tweet', tweet);
  if (tweet.geo != null || tweet.user.location != undefined) {
    console.log('================================================');
    console.log(tweet.geo);
    console.log(locationparser(tweet.user.location));
    console.log(tweet.text);
  }
});

io.on('connection', function(socket) {
  socket.on('switchtracker', function(tracker) {
    tw.untrack(curtracker);
    curtracker = tracker;
    tw.track(curtracker);
  })
})

http.listen(3000, function(){
  console.log('listening on *:3000');
});
