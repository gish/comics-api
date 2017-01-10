const express = require('express');
const request = require('request');
const comics = require('./comics');

const app = express();
const PORT = process.env.PORT || 8080;

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36';

const requestBody = (userAgent, url) => {
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

  requestBody(userAgent, comic.url)
    .then(comic.scraper)
    .then((url) => requestBody(userAgent, url))
    .then((imageData) => {
      res.writeHead(200, { 'Content-Type': `image/${comic.contentType}` });
      res.end(imageData, 'binary');
    })
    .catch(e => console.error(e));
});

app.get('/api/v1/comics/:slug/latest/url', comicValidator, (req, res) => {
  const slug = req.params.slug;
  const comic = comics[slug];

  requestBody(userAgent, comic.url)
    .then(comic.scraper)
    .then((url) => {
      res.send(url);
    })
    .catch(e => console.error(e));
});

app.listen(PORT, () => {
  console.log(`Running server at ${PORT}`);
});
