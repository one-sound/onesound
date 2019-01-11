'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent')

require ('dotenv').config()

// Application Setup
const app = express()
const PORT = process.env.PORT || 3000

// Parse request.body
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

//Database Setup
// const client = new pg.Client(process.env.PORT)
// client.connect()
// client.on('error', err => console.error(err))

// Set the view engine for server-side templating
app.set('view engine', 'ejs')

//app get
app.get('/', home);

//Function calls
function home(req, res){
  res.render('pages/index');
}

// Error handle
function handleError(err, res) {
  console.log(err);
  if(res) res.status(500).render('pages/error');
}

// Localhost listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));