const express = require('express')
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const app = express()
const dist = path.join(__dirname + '/dist');

app.get('/', (req, res) => {
  res.sendFile(dist + '/index.html')
})


// TODO: REMOVE
// Find another solution instead of checking in certs and keys.

// https.createServer({
//   key: fs.readFileSync('./ssl/key.pem'),
//   cert: fs.readFileSync('./ssl/cert.pem'),
//   passphrase: 'yux-site'
// }, app).listen(443)

// http.createServer(app).listen(80)

app.listen(80, () => {
  console.log(`Example app listening at http://localhost:80`)
})