const fs = require('fs');

// load page
const js = fs.readFileSync(`${__dirname}/../client/main.js`);

// handles the index
const getJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/babel' });
  response.write(js);
  response.end();
};

module.exports = {
  getJS,
};
