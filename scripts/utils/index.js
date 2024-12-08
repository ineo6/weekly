const path = require('path');
const fs = require('fs');

const WORKSPACE = path.join(__dirname, '../../');
const DOC_DIR = path.join(WORKSPACE, 'docs');
const SCRIPT_DIR = path.join(WORKSPACE, 'scripts');

function writeMarkdown (path, tpl, vars) {
  let template = fs.readFileSync(tpl, 'utf-8');

  for (const varsKey in vars) {
    template = template.replace(`{${varsKey}}`, vars[varsKey]);
  }

  fs.writeFileSync(path, template);
}

function writeToData (file, content) {
  fs.writeFileSync(path.join(SCRIPT_DIR, 'data', file), content);
}

module.exports = {
  writeMarkdown,
  writeToData,
  WORKSPACE,
  DOC_DIR,
  SCRIPT_DIR,
};
