const query = require('querystring');

// users json object
const users = {};

// general JSON response function
const respondJSON = (request, response, status, obj) => {
  // sets the headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // sends the response
  response.writeHead(status, headers);
  response.write(JSON.stringify(obj));
  response.end();
};

// general response for head requests
const respondMeta = (request, response, status) => {
  // writes the headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // no object, just headers and status
  response.writeHead(status, headers);
  response.end();
};

const getUsers = (request, response) => {
  // json object to respond with
  const obj = {
    users,
  };

  // return with the respondJSON function
  return respondJSON(request, response, 200, obj);
};

// only returns a 200 code
const getUsersMeta = (request, response) => respondMeta(request, response, 200);

const getNotFound = (request, response) => {
  // the response will instead be a json object with an error message and id
  const obj = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // send the response with the obj
  return respondJSON(request, response, 404, obj);
};

// response without the obj
const getNotFoundMeta = (request, response) => respondMeta(request, response, 404);

// initiates the post
const postUser = (request, response) => {
  // body of all the data that is being reassembled
  const body = [];

  // handle an error for the upload stream
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // add each piece of data to the as a chunk to the body
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // handle what happens when the whole thing is done
  request.on('end', () => {
    // turns it into a whole string
    const data = Buffer.concat(body).toString();
    // gets the params using the x-www-form-urlencoded data
    const params = query.parse(data);

    // object including the message to send back
    const responseJSON = {
      message: 'Name and age are both required.',
    };

    // if either parameter is missing then it's an error
    if (!params.name || !params.age || params.name === '' || params.age === '') {
      responseJSON.id = 'missingParams';
      return respondJSON(request, response, 400, responseJSON);
    }

    // next default it to creating a new one
    let status = 201;

    // change code if it exists, if it doesn't then create it
    if (users[params.name]) {
      status = 204;
    } else {
      users[params.name] = {};
    }

    // either adds or updates
    users[params.name].name = params.name;
    users[params.name].age = params.age;

    // sends the response for if it was created
    if (status === 201) {
      responseJSON.message = 'Created Successfully';
      return respondJSON(request, response, status, responseJSON);
    }

    // not created, so it must be updated, sends no data just a head
    return respondMeta(request, response, status);
  });
};

module.exports = {
  getUsers,
  getUsersMeta,
  getNotFound,
  getNotFoundMeta,
  postUser,
};
