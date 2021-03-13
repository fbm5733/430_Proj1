const fs = require('fs');

// load page
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

// handles the css
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

module.exports = {
  getCSS,
};
