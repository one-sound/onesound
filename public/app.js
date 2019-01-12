const container = document.querySelector('.container');
    const artistImage = document.querySelector('.artist');
    const media = document.querySelector('.overlay');
    const overlay = document.querySelector('.overlay');
    const searchElem = document.querySelector('#search');

    const getContent = (search) => {
      const url = new URL('https://itunes.apple.com/search');
      const params = { term: search, media: 'musicVideo' };
      url.search = new URLSearchParams(params);
      fetch(url, { method: 'POST'})
        .then(results => results.json())
        .then(data => {
            const resultsHTML = data.results.map(result => `
                    <div style="background-image: url(${result.artworkUrl100});"
                    onclick="openMedia('${result.previewUrl}',                         '${result.trackCensoredName}')" class="result"></div>
                    `
                    ).join('');
                    container.innerHTML = resultsHTML;
                    return fetch(data.results[0].artistViewUrl)
        })
        .then(data => data.text())
        .then(data => {
            const artistImgUrl = data.match(/https?:\/\/[a-zA-Z0-9:\/\.\-]+jpg/)[0];
            artistImage.style['background-image'] = `url(${artistImgUrl})`;
        })
    };

    getContent('beyonce');
