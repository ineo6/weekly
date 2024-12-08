const path = require('path');

const source = require('./source');
const services = require('./services');
const { writeMarkdown } = require('./utils');

const pathConfig = {
  tpl: path.join(__dirname, './tpl', 'weekly.md'),
  dest: path.join(__dirname, '../docs', 'weekly.md'),
};

const NewLine = '\n';

function createArticle (article) {
  if (article.isLeaf) {
    return `- [${article.title}](${article.link})

    ${article.desc || ''}
    `;
  } else if (article.isCategory) {
    return `### ${article.title}

    `;
  }
}

function createArticles (name, articles) {
  return `## ${name}

  ${articles.join('\n')}
  `;
}

(async function() {
  const articles = [];

  for (const key in source) {
    const func = services[key];

    if (func) {
      const list = await func(source[key]);

      articles.push({
        name: source[key].name,
        list: list.map(item => {
          return createArticle(item);
        }),
      });
    }
  }

  let content = '';

  articles.forEach(item => {
    content += createArticles(item.name, item.list) + NewLine;
  });

  writeMarkdown(pathConfig.dest, pathConfig.tpl, { articles: content });
})();

