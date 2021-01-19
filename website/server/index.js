const express = require('express')
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = express()
const dist = path.join(__dirname + '/dist');

const SSL_OPTIONS = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
  requestCert: false,
  rejectUnauthorized: false,
  passphrase: 'yux-site'
};

app.get('/', (req, res) => {
  res.sendFile(dist + '/index.html')
})


// TODO: REMOVE
// Find another solution instead of checking in certs and keys.

http.createServer(app).listen(80, () => console.log('listening on port :' + 80));
https.createServer(SSL_OPTIONS, app).listen(443, () => console.log('listening on port :' + 443));