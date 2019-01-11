DROP TABLE IF EXISTS music;

CREATE TABLE music (
 id SERIAL PRIMARY KEY,
 artist VARCHAR(255),
 song VARCHAR(255),
 album VARCHAR(255),
 genre VARCHAR(255),
 country TEXT,
 album_image_url VARCHAR(500)
);

INSERT INTO music (artist, song, album, genre, country, album_image_url) 
  values ('Miles Davis', 'Bitches Brew', 'Bitches Brew (Bonus Track Version)', 'Jazz', 'USA', 'https://is5-ssl.mzstatic.com/image/thumb/Music/v4/bb/7b/60/bb7b6090-95e9-65f5-99ed-aa072a13163e/source/100x100bb.jpg');

/*
artist
album
song
genre
country
language
album_image_url
*/
