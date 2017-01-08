const cheerio = require('cheerio');
const express = require('express');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 8080;

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36';

const comics = {
  dilbert: {
    url: 'http://dilbert.com/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('.img-comic').first().attr('src');
      return url;
    },
  },
  halge: {
    url: 'http://www.halge.se/strippar/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('.entry-featured-image-url').first().children('img').first().attr('src');
      return url;
    },
  },
  rocky: {
    url: 'http://www.dn.se/serier/rocky/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const relativeUrl = $('#article-content').find('a[href$="gif"]').attr('href');
      const url = `http://www.dn.se/${relativeUrl}`;
      return url;
    },
  },
  userfriendly: {
    url: 'http://userfriendly.org/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('[alt="Latest Strip"]').first().attr('src');
      return url;
    },
  },
};

const getLatestStripUrl = (userAgent, url, scraper) => {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: {
        'User-Agent': userAgent,
      }
    };

    request(options, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error);
      }

      resolve(scraper(body));
    });
  });
}

const getImageData = userAgent => (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: {
        'User-Agent': userAgent,
      },
      encoding: null,
    }

    request(options, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error)
      }
      resolve(body);
    })
  })
}

app.get('/api/v1/comics/dilbert/latest', (req, res) => {
  getLatestStripUrl(userAgent, comics.dilbert.url, comics.dilbert.scraper)
    .then(getImageData(userAgent))
    .then((imageData) => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(imageData, 'binary');
    })
    .catch(e => console.error(e));
});

app.get('/api/v1/comics/rocky/latest', (req, res) => {
  getLatestStripUrl(userAgent, comics.rocky.url, comics.rocky.scraper)
    .then(getImageData(userAgent))
    .then((imageData) => {
      res.writeHead(200, { 'Content-Type': 'image/gif' });
      res.end(imageData, 'binary');
    })
    .catch(e => console.error(e));
});

app.get('/api/v1/comics/halge/latest', (req, res) => {
  getLatestStripUrl(userAgent, comics.halge.url, comics.halge.scraper)
    .then(getImageData(userAgent))
    .then((imageData) => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(imageData, 'binary');
    })
    .catch(e => console.error(e));
});

app.get('/api/v1/comics/userfriendly/latest', (req, res) => {
  getLatestStripUrl(userAgent, comics.userfriendly.url, comics.userfriendly.scraper)
    .then(getImageData(userAgent))
    .then((imageData) => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(imageData, 'binary');
    })
    .catch(e => console.error(e));
});

app.listen(PORT, () => {
  console.log(`Running server at ${PORT}`);
});
