const cheerio = require('cheerio');
const express = require('express');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 8080;

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36';

const comics = {
  'ballard-street': {
    url: 'http://www.gocomics.com/ballardstreet/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('.item-comic-image').children('img').first().attr('src');
      return url;
    },
    contentType: 'jpeg',
  },
  dilbert: {
    url: 'http://dilbert.com/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('.img-comic').first().attr('src');
      return url;
    },
    contentType: 'jpeg',
  },
  halge: {
    url: 'http://www.halge.se/strippar/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('.entry-featured-image-url').first().children('img').first().attr('src');
      return url;
    },
    contentType: 'jpeg',
  },
  rocky: {
    url: 'http://www.dn.se/serier/rocky/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const relativeUrl = $('#article-content').find('a[href$="gif"]').attr('href');
      const url = `http://www.dn.se/${relativeUrl}`;
      return url;
    },
    contentType: 'image/gif',
  },
  userfriendly: {
    url: 'http://userfriendly.org/',
    scraper: (body) => {
      const $ = cheerio.load(body);
      const url = $('[alt="Latest Strip"]').first().attr('src');
      return url;
    },
    contentType: 'jpeg',
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

const comicValidator = (req, res, next) => {
  const slug = req.params.slug;
  const comic = comics[slug];

  if (!comic) {
    res.sendStatus(404);
    return;
  }

  next();
};

app.get('/api/v1/comics/:slug/latest', comicValidator, (req, res) => {
  const slug = req.params.slug;
  const comic = comics[slug];

  getLatestStripUrl(userAgent, comic.url, comic.scraper)
    .then(getImageData(userAgent))
    .then((imageData) => {
      res.writeHead(200, { 'Content-Type': comic.contentType });
      res.end(imageData, 'binary');
    })
    .catch(e => console.error(e));
});

app.get('/api/v1/comics/:slug/latest/url', comicValidator, (req, res) => {
  const slug = req.params.slug;
  const comic = comics[slug];

  getLatestStripUrl(userAgent, comic.url, comic.scraper)
    .then((url) => {
      res.send(url);
    })
    .catch(e => console.error(e));
});

app.listen(PORT, () => {
  console.log(`Running server at ${PORT}`);
});
