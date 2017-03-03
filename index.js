'use strict';

const express = require('express');
const path = require('path');
// Constants
const PORT = 8080;

// App
const app = express();
app.use('/assets', express.static(path.join(__dirname + '/assets')));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
