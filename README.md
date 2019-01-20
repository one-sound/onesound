# onesound
Team: HN, Jared K, Jerome J, Michael L

OneSound aims to unite people of all cultures through the love of music. Users will select a genre of music or an artist they feel like listening to, and a playlist of songs from diverse cultures and languages will be generated. The world is vast, but we believe music is a universal language that can bring us all a little closer together.

## Problem Domain
- Problem: Same old music
- Solution: Provide new music that is similar to what someone likes, but from different countries (randomized)

- Problem: Close-mindedness regarding other cultures
- Solution: Open up peoples' minds to other cultures and languages through a universal medium -- music.

## Versioning
1.0.0. Initial version that outputs tracks from randomized countries based on genre.

## Libraries, Frameworks & Packages
- Express
- PostgreSQL
- Superagent
- EJS
- MusixMatch API
- Method-Override

## How to Use
Onesound can be accessed at [onesound1.herokuapp.com](https://onesound1.herokuapp.com/). To start, the user must search by artist or genre. From there, a list of recommended songs will be generated. The user may add songs they are interested in to their playlist, which can also be accessed through the navigation bar. Saved songs can also be removed at any time. Within the generated data will be links to Wikipedia that can allow the user to delve deeper into learning about an artist or language.

## API Endpoints
#### Getting Tracks
https://api.musixmatch.com/ws/1.1/track.search?apikey=${process.env.MUSIXMATCH_API_KEY}&s_track_rating=desc&s_artist_rating=desc&f_has_lyrics&limit=10

This searches for the highest rated tracks and artists based on the search. Limits to 10. Filters by songs that have lyrics in database as these are more likely to have more accurate and complete data.

##### Response:
```
{
  "message": {
    "header": {
      "status_code": 200,
      "execute_time": 0.00136,
      "available": 646
    },
    "body": {
      "track_list": [
        {
          "track": "track'"
        },
        {
          "track": "track'"
        },
        {
          "track": "track'"
        }
      ]
    }
  }
}
```

#### Requesting Album Info based on artist

##### Response:
```
{
  "message": {
    "header": {
      "status_code": 200,
      "execute_time": 0.071532011032104
    },
    "body": {
      "artist": {
        "artist_id": 118,
        "artist_mbid": "0383dadf-2a4e-4d10-a46a-e9e041da8eb3",
        "artist_name": "Queen",
        "artist_country": "GB",
        "artist_alias_list": [
          {
            "artist_alias": "\u5973\u738b"
          }
        ],
        "artist_rating": 91,
        "artist_twitter_url": "",
        "updated_time": "2012-06-11T08:19:15Z"
      }
    }
  }
}
```

#### Obtaining list of Music Genre IDs

##### Response:
```
{
  "message": {
    "header": {
      "status_code": 200,
      "execute_time": 0.0080771446228027
    },
    "body": {
      "music_genre_list": [
        {
          "music_genre": {
            "music_genre_id": 34,
            "music_genre_parent_id": 0,
            "music_genre_name": "Music",
            "music_genre_name_extended": "Music",
            "music_genre_vanity": "Music"
          }
         
         [...200+ more] ...
```
## Database Schemas
```
CREATE TABLE music (
 id SERIAL PRIMARY KEY,
 artist VARCHAR(255),
 song VARCHAR(255),
 album VARCHAR(255),
 genre VARCHAR(255),
 genre_id NUMERIC(10),
 country TEXT,
 album_image_url VARCHAR(500),
 album_release_date VARCHAR(255)
);
```

## With Help From
- Pixabay for stock imagery
- Flat icon for logo and icons

