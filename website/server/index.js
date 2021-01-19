const express = require('express')
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express()
const dist = path.join(__dirname + 'dist');

app.get('/', (req, res) => {
  res.sendFile(dist + '/index.html')
})


// TODO: REMOVE
// Find another solution instead of checking in certs and keys.

https.createServer({
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
  passphrase: 'yux-site'
}, app).listen(443)

https.createServer(app).listen(80)
