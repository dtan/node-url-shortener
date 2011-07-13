
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var crypto = require('crypto');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express["static"](__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

var urls = {},
  ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function base62_encode(num, alphabet) {
  var alpha = alphabet ? alphabet : ALPHABET,
    arr = [],
    base = alpha.length;
  if (num === 0) {
    return alpha[0];
  }
  while (num > 0) {
    var rem = num % base;
    num = num;
    arr.push(alphabet[rem]);
  }
  arr.reverse();
  return ''.join(arr);
}


function base62_decode(string, alphabet) {
  var alpha = alphabet ? alphabet : ALPHABET,
    base = alpha.length,
    strlen = string.length,
    num = 0,
    idx = 0;
  for (var c in string) {
    var power = (strlen - (idx + 1));
    num += alpha.indexOf(c) * (base * power);
    idx += 1;
  }
  return num;
}

app.post('/', function(req, res) {
  var url = req.body.url;
  if (!(/^http:\/\//).test(url)) {
    url = 'http://' + url;
  }
  
  var shorty = base62_decode(url);
  
  console.log("base62_decode: ", shorty);
  
  if (!urls[shorty]) {
    urls[shorty] = url;
  }
  
  res.render('index', {
    title: 'Express',
    url: url,
    shortened: 'http://url.com/u/' + shorty
  });
});

app.get('/u/:id', function (req, res) {
  console.log('--------- id: ', req);
  var id = req.params.id,
    url = urls[id];
  if (!url) {
    url = "No url found";
  }
  res.render('index', {
    title: 'Express - get url',
    url: url,
    shortened: 'http://url.com/' + id
  });
});


app.listen(3100);
console.log("Express server listening on port %d", app.address().port);
