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
const client = new pg.Client(process.env.DATABASE_URL)
client.connect()
client.on('error', err => console.error(err))

// Set the view engine for server-side templating
app.set('view engine', 'ejs')

// Routes
app.get('/', home);

app.post('/searches', search);

//Function calls
function home(req, res){
  res.render('pages/index');
}

// Search
function search(req, res) {
  let searchStr = req.body.search
  console.log(req.body)
  console.log(searchStr);
  let searchType = req.body.search
  console.log(searchType);
  let url = `https://itunes.apple.com/search?term=${searchStr}`

// Search Type Conditionals
if(searchType === 'artist') {
  url += `${searchStr}`
} else if (searchType === 'song title') {
  url += `${searchStr}`
} else if (searchType === 'genre') {
  url += `${searchStr}`
}
console.log(url);
// Superagent Request
return superagent.get(url)
// request.post('/user')
   .set('Content-Type', 'application/json')
  .then(result => {

    console.log(result);
    // let musics = result.body.results.map(song => new Song(song))
    let musics = JSON.stringify(result.body.results)
    console.log(musics);
    res.render('pages/index', {musics})
  })

}

// Error handle
function handleError(err, res) {
  console.log(err);
  if(res) res.status(500).render('pages/error');
}


// Constructor
function Music(obj){
  this.artist = obj.results[0].artistName;
  this.album = obj.results[0].collectionName;
  this.song = obj.results[0].trackName;
  this.genre = obj.results[0].primaryGenreName;
  this.country = obj.results[0].country;
  this.album_image_url = obj.results[0].artworkUrl100;
}


// Localhost listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));