const path = require('path');
const fs = require('fs');
const { analysisMarkdown } = require('./convertMarkdown');
const { SCRIPT_DIR } = require('./utils');
const { WORKSPACE } = require('./utils');
const { writeToData } = require('./utils');
const { DOC_DIR } = require('./utils');

function updateLink () {
  const indexContent = fs.readFileSync(path.join(SCRIPT_DIR, 'data', 'index.json'), 'utf-8');
  const links = indexContent ? JSON.parse(indexContent) : [];
  let result = [];

  for (const link of links) {
    result = result.concat(analysisMarkdown(path.join(WORKSPACE, link.path), link.cate));
  }

  writeToData('links.json', JSON.stringify(result));
}

function updateArticles (cate) {
  const yearDirs = fs.readdirSync(path.join(DOC_DIR, cate));

  const files = [];

  for (const year of yearDirs) {
    const mdFiles = fs.readdirSync(path.join(DOC_DIR, cate, year));

    for (const mdFile of mdFiles) {
      files.push({
        cate,
        path: path.relative(WORKSPACE, path.join(DOC_DIR, cate, year, mdFile)),
      });
    }
  }

  writeToData('index.json', JSON.stringify(files));
}


updateLink('news');
