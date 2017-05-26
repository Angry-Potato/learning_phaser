'use strict';

const express = require('express');
const path = require('path');
// Constants
const PORT = process.env.PORT || 8080;

// App
const app = express();
app.use('/img', express.static(path.join(__dirname + '/img')));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
