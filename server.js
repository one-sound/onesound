'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

require ('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Parse request.body
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

//Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

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
  // let url = `https://itunes.apple.com/search?term=${searchStr}&limit=50`
  let url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${process.env.MUSIXMATCH_API_KEY}&s_track_rating=desc&s_artist_rating=desc&f_has_lyrics&limit=10`

  // Search Type Conditionals
  if(searchType === 'artist') {
    url += `&q_artist=${searchStr}`
  } else if (searchType === 'title') {
    url += `&q_track=${searchStr}`
  } else if (searchType === 'genre') {
    url += `&f_music_genre_id=${searchStr}`
  }
  // console.log(url);

  // Superagent Request
  superagent.get(url)
  // request.post('/user')
    .set('Content-Type', 'application/json')
    .then(result => {
      const playList = [];
      let counter = 0;
      // console.log(result.text);
      let musics = JSON.parse(result.text);
      let trackList = musics.message.body.track_list;

      trackList.forEach(song => {
        const artistCountry = getArtistCountry(song); //needs to obtain artist country thru a separate API call
        artistCountry.then((result) => {
          // const albumData = getAlbumData(song);
          let newSong = new Music(song.track, result);
          playList.push(newSong);
          counter++;//makes sure that all of items in forEach has finished before rendering

          if (counter === trackList.length){ //makes sure that all of items in forEach has finished before rendering
            renderPlaylist(playList, res);
          }

          // this will be where we call a function to obtain album cover
          // albumData.then(data => {

          // })
        })
      })
    }).catch(err => console.log(err));
}

function renderPlaylist(playList, res){
  res.render('pages/searches/show', {playList});
}

function getArtistCountry(song){
  let url = `https://api.musixmatch.com/ws/1.1/artist.get?apikey=${process.env.MUSIXMATCH_API_KEY}&artist_id=`;
  url += song.track.artist_id;
  return superagent.get(url)
    .then(result => {
      let artist = JSON.parse(result.text);
      let artistCountry = artist.message.body.artist.artist_country;
      return artistCountry;
    }).catch(err => handleError(err));
}

function getAlbumData(song){ //what will be used to obtain album art data
  let url = `https://api.musixmatch.com/ws/1.1/album.get?apikey=${process.env.MUSIXMATCH_API_KEY}&album_id=`;
  url += song.track.album_id;

  return superagent.get(url)
    .then(result => {
      let album = JSON.parse(result.text);
      return albumData;
      // }
    }).catch(err => handleError(err));
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
  this.genre = obj.primary_genres.music_genre_list[0].music_genre.music_genre_name || '-'; //not all tracks have a genre listed in musixmatch
  this.genre_id = obj.primary_genres.music_genre_list[0].music_genre.music_genre_id || 0; //what gets input from musixmatch api - not rendered
  this.country = artistCountry;
  this.album_image_url = obj.album_art || '/assets/nophoto.JPG';
}

// Localhost listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
