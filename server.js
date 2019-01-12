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
function home(req, res) {
  res.render('pages/index');
}

// function home(req, res){
//   let SQL = 'SELECT * FROM music';

//   return client.query(SQL)
//     .then(data => {
//       res.render('pages/index', {music: music.rows});
//     })
//     .catch(err => {
//       console.log(err);
//       res.render('pages/error', {err});
//     });
// }

// Search
function search(req, res) {

  let searchStr = req.body.search[0]
  // console.log(searchStr);
  let searchType = req.body.search[1]
  let url = `https://itunes.apple.com/search?term=${searchStr}&kind=song&limit=10&lang`
  
  // Search Type Conditionals
  if(searchType == 'artist') {
    url += `&artistName=${searchStr}`
  } else if (searchType == 'title') {
    url += `&trackName=${searchStr}`
  } else if (searchType == 'genre') {
    url += `&primaryGenreName=${searchStr}`
  }
  console.log(searchType);
  console.log(url);
  // Superagent Request
  return superagent.get(url)
  // request.post('/user')
    .set('Content-Type', 'application/json')
    .then(result => {
      let musics = JSON.parse(result.text);
      // console.log(result.text);
      const playList = musics.results.map(song => new Music(song))
      // console.log(musics);
      console.log(playList)
      res.redirect('/')
      // res.render('pages/index', {musics})
      console.log(searchType)
    })

}

// Error handle
function handleError(err, res) {
  console.log(err);
  if(res) res.status(500).render('pages/error');
}


// Constructor
function Music(obj){
  this.artist = obj.artistName;
  this.album = obj.collectionName;
  this.song = obj.trackName;
  this.genre = obj.primaryGenreName;
  this.country = obj.country;
  this.album_image_url = obj.artworkUrl100;
}


// Localhost listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
