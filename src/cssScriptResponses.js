const fs = require('fs');

// load page
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const js = fs.readFileSync(`${__dirname}/../client/main.js`);

// handles the css
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// handle js
const getJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/babel' });
  response.write(js);
  response.end();
};

module.exports = {
  getCSS, getJS,
};
