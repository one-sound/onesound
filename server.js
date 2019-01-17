'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');
const albumArt = require('album-art');
require ('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Parse request.body
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride((req, res) => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body) {
    console.log(req.body['_method']);
    let method = req.body['_method'];
    delete req.body['_method'];
    return method; //returns PUT, PATCH, POST, GET, or DELETE.
  }
}))
//Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Routes
app.get('/', home);
app.get('/about', about);
app.get('/saved', saved);
app.post('/searches', search);
app.post('/show', addSong);
app.delete('/show', deleteSong);
//Function calls
function home(req, res) {
  res.render('pages/index');
}
function about(req, res) {
  res.render('pages/about');
}


// var genre = music.genres.get;
var baseURL = 'https://api.musixmatch.com/ws/1.1';

// Search
function search(req, res) {
  let searchStr = req.body.search[0];
  let searchType = req.body.search[1];
  console.log(searchType)

  let url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${process.env.MUSIXMATCH_API_KEY}&s_track_rating=desc&s_artist_rating=desc&f_has_lyrics&limit=10`;

  // Search Type Conditionals
  if (searchType === 'genre') {
    let genreID = fetchGenre(searchStr);
    genreID.then(result => {
      url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${process.env.MUSIXMATCH_API_KEY}&f_music_genre_id=${result}`;
      // console.log(url)
      superagent.get(url)
      // request.post('/user')
        // .set('Content-Type', 'application/json')
        .then(result => {
          const playList = [];
          let counter = 0;
          let musics = JSON.parse(result.text);
          let trackList = musics.message.body.track_list;

          trackList.forEach(song => {
            // console.log(song.track.primary_genres.music_genre_list);
          })
        })
    });
  } else if(searchType === 'artist') {
    url += `&q_artist=${searchStr}`;
  } else if (searchType === 'title') {
    url += `&q_track=${searchStr}`;
  }

  // Superagent Request
  superagent.get(url)
  // request.post('/user')
    // .set('Content-Type', 'application/json')
    .then(result => {
      const playList = [];
      let counter = 0;
      let musics = JSON.parse(result.text);
      console.log(musics);
      let trackList = musics.message.body.track_list;
      //console.log(trackList)
      debugger;
      // trackList.forEach(song => {
      //   // console.log(song.track.primary_genres.music_genre_list);
      // })

      trackList.forEach(song => {
        //console.log(trackList)
        const artistCountry = getArtistCountry(song); //needs to obtain artist country thru a separate API call
        artistCountry.then((result) => {
          let albumData = getAlbumData(song.track);
          albumData.then(data => {
            console.log(song.track.album_name);
            let albumCover = albumArt(song.track.artist_name);
            albumCover.then(coverArt => {
              if (coverArt == 'Error: JSON - 6 The artist you supplied could not be found'){
                coverArt = '/assets/record.JPG';
              }
              if (coverArt == 'Error: No image found'){
                coverArt = '/assets/record.JPG';
              }
              if (searchStr === 'genre'){
                playList.push(new Music(song.track, result, data, coverArt, searchStr));
              } else{
                playList.push(new Music(song.track, result, data, coverArt));
              }
              counter++;//makes sure that all of items in forEach has finished before rendering
              if (counter === trackList.length){ //makes sure that all of items in forEach has finished before rendering
                res.render('pages/searches/show', {playList});
                console.log(playList)
                musicMatcher(playList);
              }
            })
          })
        })
      })

    }).catch(err => console.log(err));
}

// // Get By Id
// function getById(song) { // using this function to match the genres for each artist
//   let url = `${baseURL}/${type}.get?format=json&apikey=${process.env.MUSIXMATCH_API_KEY}`;
//   console.log(url);

//   if (type == 'genre') { url += `&f_music_genre_id=${id}`; }

//   return superagent.get(url)
//     .then(result => {
//       let musicGenre = JSON.parse(result.text);
//       let searchGenre = musicGenre.message.body.genre.music_genre_list;
//       return searchGenre;
//     }).catch(err => handleError(err));

// }

// function renderPlaylist(playList, res){
//   res.render('pages/searches/show', {playList});
// }

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

function getAlbumData(song){ //what will be used to obtain album art data + release date
  let url = `https://api.musixmatch.com/ws/1.1/album.get?apikey=${process.env.MUSIXMATCH_API_KEY}&album_id=`;
  url += song.album_id;

  return superagent.get(url)
    .then(result => {
      let album = JSON.parse(result.text);
      let art = ''; //art search term goes here
      let releaseDate = album.message.body.album.album_release_date;
      return [art, releaseDate];
    }).catch(err => handleError(err));
}

function fetchGenre(searchStr){
  //console.log('** Fetching Genre')
  let url = `https://api.musixmatch.com/ws/1.1/music.genres.get?apikey=${process.env.MUSIXMATCH_API_KEY}`;

  return superagent.get(url)
    .then(result => {
      let parsedResult = JSON.parse(result.text);
      let genres = parsedResult.message.body.music_genre_list;

      const getID = () => {
        return genres.reduce((a, c) => {
          let genreName = c.music_genre.music_genre_name;
          if (genreName.toLowerCase() === searchStr.toLowerCase()) a.push(c.music_genre.music_genre_id);
          return a;
        }, []);
      };

      const match = getID().pop();
      //console.log('** GENRE ID is' + match);
      return match;
    });
}

// Database
function addSong(req, res){
  //takes in info from form and creates new object
  let addedSong = new dbMusic(req.body);
  let songs = Object.values(addedSong);
  // songs.pop();

  //adds to SQL
  let SQL = `INSERT INTO music
            (artist, song, album, genre, genre_id, country, album_image_url, album_release_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`;

  // redirects to saved playlist view
  client.query(SQL, songs)
    .then(() => {
      const selection = `SELECT * FROM music;`
      client.query(selection)
        .then(data => {
          res.render('pages/lists/show', {playList: data.rows});
        }).catch(err => handleError(err));
    }).catch(err => handleError(err));
}

function deleteSong(req, res) {
  console.log(`deleting the song ${req.body.song}`);
  client.query(`DELETE FROM music WHERE song=$1`, [req.body.song])
  // client.query(`DELETE FROM music WHERE `)
    .then(result => {
      console.log(result);
      res.redirect('/saved');
    })
    .catch(err => {
      console.log('delete song error')
      return handleError(err, res);
    })
}
// Saved songs in Database
function saved(req, res) {

  const selection = `SELECT * FROM music;`
  client.query(selection)
    .then(data => {
      res.render('pages/saved', {playList: data.rows});
    }).catch(err => {
      console.log(err);
      res.render('pages/error', {err});
    });
}


// Matching logic
function musicMatcher(tracks){
  //takes in playlist of songs - goes through each and sees if it has a genre + release date + country of origin listed
  //picks first song
  let songMatch = tracks.filter(song => {
    if (song.country && song.genre && song.genre !== '-') return song;
  })[0];

  //if it has a genre + release date listed, then searches for database based on genre (ex: pop)

  //+ lyrics language (randomized from a JSON file)

  let urls = makeURL(songMatch, 50);
  // console.log(urls)
  let list = [];
  let counter = 0;
  Promise.all(urls[0].map(getter))
    .then(result => {
      for (var i in urls[0]){
        let parsedResult = JSON.parse(result[i].text);
        let addedTrack = parsedResult.message.body.track_list[0];
        // console.log(addedTrack);

        if (addedTrack === undefined){
          //console.log('** INVALID ');
        } else if (addedTrack.track !== undefined){
          let albumData = getAlbumData(addedTrack.track);
          albumData.then(data => {
            let newSong = new Music(addedTrack.track, urls[1][counter], data);
            list.push(newSong);
            // console.log(newSong)
            counter++;
            //console.log('** COUNTER ' + counter);
            if (counter === 10) {
              console.log(list)
            }
          })
        }
      }
    })
}

function makeURL(songMatch, qty){
  let urls = [];
  let languages = [];
  const countryData = require('./country-codes.json');
  for (var i = 0; i < qty; i++){
    let url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${process.env.MUSIXMATCH_API_KEY}&s_track_rating=desc&s_artist_rating=desc&f_music_genre_id=${songMatch.genre_id}&limit=10`;

    let random = randomNumber(countryData);
    url += `&f_lyrics_language=${countryData[random].code}`;

    urls.push(url);
    languages.push(countryData[random].name);
  }
  return [urls, languages];
}

function getter(url){
  return superagent.get(url)
    .catch(err => {
      handleError(err);
      return null;
    })
}

function randomNumber(countryData){
  let random = Math.floor(Math.random() * countryData.length);
  return random;
}

// Error handle
function handleError(err, res) {
  console.log(err);
  if(res) res.status(500).render('pages/error');
}

// Constructor
function Music(obj, artistCountry, albumData, coverArt, searchedGenre){
  this.artist = obj.artist_name;
  this.album = obj.album_name;
  this.song = obj.track_name;
  this.genre = searchedGenre || obj.primary_genres.music_genre_list[0] && obj.primary_genres.music_genre_list[0].music_genre.music_genre_name || '-'; //not all tracks have a genre listed in musixmatch
  this.genre_id = obj.primary_genres.music_genre_list[0] && obj.primary_genres.music_genre_list[0].music_genre.music_genre_id || 0; //what gets input from musixmatch api - not rendered
  this.country = artistCountry;

  this.album_image_url = coverArt || '/assets/nophoto.JPG';
  this.album_release_date = albumData[1] || '-';
}

function dbMusic(obj, coverArt){
  this.artist = obj.artist;
  this.album = obj.album;
  this.song = obj.song;
  this.genre = obj.genre;
  this.genre_id = obj.genre_id; //what gets input from musixmatch api - not rendered
  this.country = obj.country;

  this.album_image_url = coverArt || '/assets/nophoto.JPG';
  this.album_release_date = obj.album_release_date;
}

// Localhost listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
