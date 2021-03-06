const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const cssHandler = require('./cssResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': cssHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    '/notReal': jsonHandler.getNotFound,
    notFound: jsonHandler.getNotFound,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    '/notReal': jsonHandler.getNotFoundMeta,
    notFound: jsonHandler.getNotFoundMeta,
  },
  POST: {
    '/addUser': jsonHandler.postUser,
    notFound: jsonHandler.getNotFound,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // checks if it is a post, then if not,
  // calls the correct thing based on the struct
  if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response);
  } else {
    urlStruct[request.method].notFound(request, response);
  }
};

// run server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
