const fs = require('fs');

// load page
const transparent = fs.readFileSync(`${__dirname}/../client/transparent.gif`);

// handles the transparent image
const getTransparent = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/gif' });
  response.write(transparent);
  response.end();
};

module.exports = {
  getTransparent,
};
