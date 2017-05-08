const cheerio = require('cheerio');

module.exports = {
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
      const url = $('.teaser-link').first().attr('href');
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
