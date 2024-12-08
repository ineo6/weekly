const Parser = require('rss-parser');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const parser = new Parser();

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
};

async function extractFromIssue ({ title, link }) {
  const result = await fetch(link, {
    headers: headers,
  });

  const html = await result.text();

  const $ = cheerio.load(html);

  const articles = [];

  $('#content>table, #content>p').each(function() {
    const currentDom = $(this);

    const className = (currentDom.attr('class') || '').trim().split(' ');

    const article = {};

    if (className.includes('el-item')) {
      const title = currentDom.find('.mainlink>a');
      article.title = title.text();
      article.link = title.attr('href');

      const titleWithDesc = currentDom.find('.desc').text();

      const titleWithDescArr = titleWithDesc.split(' — ');

      if (titleWithDescArr && titleWithDescArr.length) {
        article.desc = titleWithDescArr[1];
      }

      article.level = 3;
      article.isLeaf = true;
    } else if (this.tagName === 'p') {
      article.title = currentDom.text();
      article.level = 2;
      article.isCategory = true;
    }

    article.title && articles.push(article);
  });

  // $('.el-item.item').each(function() {
  //   const article = {};
  //
  //   const title = $(this).find('.mainlink>a');
  //   article.title = title.text();
  //   article.link = title.attr('href');
  //
  //   const titleWithDesc = $(this).find('.desc').text();
  //
  //   const titleWithDescArr = titleWithDesc.split(' — ');
  //
  //   if (titleWithDescArr && titleWithDescArr.length) {
  //     article.desc = titleWithDescArr[1];
  //   }
  //
  //   articles.push(article);
  // });

  return articles;
}

module.exports = async function({ url }) {
  const feed = await parser.parseURL(url);

  let result = [];

  if (feed && feed.items && feed.items.length) {
    result = await extractFromIssue(feed.items[0]);
  }

  return result;
};
