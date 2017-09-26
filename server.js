var http = require('http');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var validator = require('express-validator');

var db = require('./db');

var app = express();

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator);

var server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, 'client')));

app.post('/', async (req, res) => {
  console.log("POST request received");
  req.checkBody('url', "Enter a valid url").isURL();
  //req.validationErrors for handling
  
  let url = req.body.url;
  let html = await htmlRequest(url);
  console.log('html: ', html);
  res.status(200).send(html);
});

app.get('/', (req, res) => {
  console.log("GET request received");

});

app.put('/',(req, res) => {
  console.log("PUT request received");
  
});

app.delete('/', (req, res) => {
  console.log("DELETE request received");
  
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

async function htmlRequest(url){
  return new Promise((resolve, reject) => {
    const http = url.startsWith('https') ? require('https') : require('http');
    let req =http.get(url, res => {
      let chunks = [];
      res.on('data', chunk => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        console.log('response end, returning html');
        resolve(Buffer.concat(chunks).toString());
      });
    });
    req.on('error', err => {
      console.log('HTTPGet request error: ', err);
      reject(err);
    });
  });

};
