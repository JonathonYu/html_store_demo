var http = require('http');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var uuid = require('uuid');

var db = require('./db');

var app = express();

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());

var server = http.createServer(app);
app.use(express.static(path.resolve(__dirname, 'client')));

app.post('/', async (req, res) => {
  console.log("POST request received");
  req.checkBody('url', "Enter a valid url").isURL();
  //req.validationErrors for handling
   let url = req.body.url;
  let html = await htmlRequest(url);
  let jobID = uuid();
  console.log('html: ', html);
  db.create({
    jobID: jobID,
    html: html
  }, err => {
    if(err) {
      return res.status(500).send("Database create document error");
    }
  });
  console.log("uuid: ", jobID);
  res.status(200).send(html);
});

app.get('/', (req, res) => {
  console.log("GET request received");
  req.checkQuery('id', "Enter a correctly-formatted UUID").isUUID();
  let jobID = req.query.id;
  db.findOne({
    jobID: jobID
  }, 'html', (err, job) => {
    if(err) {
      return res.status(500).send("db find returned error"); //check docs; specify if it's simply not found
    }
    res.status(200).send(job);
  });
});

app.put('/',(req, res) => {
  console.log("PUT request received");
  res.status(200).send("Put request received");
});

app.delete('/', (req, res) => {
  console.log("DELETE request received");
  
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
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
