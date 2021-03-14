const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const cssHandler = require('./cssResponses.js');
const imgHandler = require('./imgResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': cssHandler.getCSS,
    '/transparent.gif': imgHandler.getTransparent,
    '/getTeams': jsonHandler.getTeams,
    '/getTeam': jsonHandler.getTeam,
    '/getSpeciesData': jsonHandler.getSpeciesData,
    notFound: jsonHandler.getNotFound,
  },
  HEAD: {
    '/getTeams': jsonHandler.getTeamsMeta,
    '/getTeam': jsonHandler.getTeamMeta,
    '/getSpeciesData': jsonHandler.getSpeciesDataMeta,
    notFound: jsonHandler.getNotFoundMeta,
  },
  POST: {
    '/postTeam': jsonHandler.postTeam,
    notFound: jsonHandler.getNotFound,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // query parameters
  const params = query.parse(parsedUrl.query);

  // checks if it is a post, then if not,
  // calls the correct thing based on the struct
  if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response, params);
  } else {
    urlStruct[request.method].notFound(request, response, params);
  }
};

// run server
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
