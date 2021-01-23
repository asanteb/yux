const express = require('express')
const path = require('path');
const app = express()
const dist = path.join(__dirname + '/dist');

const environment = process.env.NODE_ENV;

const PORTS = {
  prod: 3000,
  dev: 3001,
  test: 3002,
  latest: 3003
};

const PORT = PORTS[environment];

app.get('/', (req, res) => {
  res.sendFile(dist + '/index.html')
});

app.listen(PORT, () => {
  console.log(`listening on port :${PORT}`)
});
