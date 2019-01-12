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
app.get('/about', about);
app.post('/searches', search);

//Function calls
function home(req, res) {
  res.render('pages/index');
}
function about(req, res) {
  res.render('pages/about');
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
  let searchStr = req.body.search[0];
  let searchType = req.body.search[1];

  // console.log(searchType);
  // let url = `https://itunes.apple.com/search?term=${searchStr}&limit=10`
  let url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${process.env.MUSIXMATCH_API_KEY}`

  // Search Type Conditionals
  if(searchType === 'artist') {
    url += `&q_artist=${searchStr}`
  } else if (searchType === 'song title') {
    url += `&q_track=${searchStr}`
  } else if (searchType === 'genre') {
    url += `&f_music_genre_id=${searchStr}`
  }
  // console.log(url);

  // Superagent Request
  return superagent.get(url)
  // request.post('/user')
    .set('Content-Type', 'application/json')
    .then(result => {
      let musics = JSON.parse(result.text);
      // console.log(musics.message.body.track_list[0].track.primary_genres.music_genre_list)
      
      getAristCountry(req, res, musics)

      // console.log(musics);
      // console.log(playList)
    })
}

function getAristCountry(req, res, result){
  const playList = [];
  let trackList = result.message.body.track_list;
  trackList.forEach(song => {
    let url = `https://api.musixmatch.com/ws/1.1/artist.get?apikey=${process.env.MUSIXMATCH_API_KEY}&artist_id=`;
    url += song.track.artist_id;

    return superagent.get(url)
      .then(result => {
        let artist = JSON.parse(result.text);
        let artistCountry = artist.message.body.artist.artist_country;

        let newSong = new Music(song.track, artistCountry);
        playList.push(newSong);
      })
  })
  res.render('pages/searches/show', {playList});
}

// Error handle
function handleError(err, res) {
  console.log(err);
  if(res) res.status(500).render('pages/error');
}

// Constructor
function Music(obj, artistCountry){
  this.artist = obj.artist_name;
  this.album = obj.album_name;
  this.song = obj.track_name;
  // this.genre = obj.track.primary_genres.music_genre_list[0];
  this.country = artistCountry;
  // this.album_image_url = obj.artworkUrl100;
  console.log(this)
}


// Localhost listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
