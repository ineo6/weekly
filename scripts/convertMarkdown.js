const MarkdownIt = require('markdown-it');
const fs = require('fs');
const path = require('path');

const partMap = new Map([
  ['📰 News', {
    type: 2,
  }],
  ['🛠 工具、软件', {
    type: 1,
  }],
  ['📖 文章', {
    type: 0,
  }],
]);

const headingTags = new Set(['h3']);
const ignoredTokens = new Set(['heading_open', 'heading_close']);

function isLink (token) {
  if (token.type === 'inline') {
    if (token.children) {
      return !!token.children.find(item => item.tag === 'a');
    }
  }

  return false;
}

function extractLinkMeta (token) {
  let title = null;
  let href = null;

  token.children.forEach(item => {
    if (item.tag === 'a' && item.type === 'link_open') {
      href = new Map(item.attrs).get('href');
    } else if (item.type === 'text') {
      title = item.content;
    }
  });

  return {
    title,
    href,
  };
}

function analysisMarkdown (file, type) {
  const content = fs.readFileSync(file, 'utf-8');

  const markdownIt = new MarkdownIt();
  const tokens = markdownIt.parse(content, {});

  let headingToken = null;

  let closedLink = null;

  const result = [];

  for (const token of tokens) {
    if (isLink(token)) {
      closedLink = extractLinkMeta(token);
    }

    // console.log(token)

    if (token.tag === 'h3') {
      if (token.type === 'heading_open') {
        headingToken = token.markup;
      } else if (token.type === 'heading_close') {
        headingToken = null;
      }
    }

    if (ignoredTokens.has(token.type)) {
      continue;
    }

    if (headingToken === null) {
      continue;
    }

    result.push({
      type,
      link: closedLink,
      head: token.children.map((t) => t.content).join(''),
    });

    // console.log(token.children.map((t) => t.content).join(''));
  }

  result.reduce(function(prev, next) {
    prev.link = next.link;
    return next;
  }, result[0]);

  result[result.length - 1].link = closedLink;

  return result;
}

module.exports = {
  analysisMarkdown,
};
