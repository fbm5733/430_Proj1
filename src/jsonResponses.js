// creates the pokedex object
const Pokedex = require('pokedex-promise-v2');

const P = new Pokedex();

// teams json object
const teams = {
  0: {
    name: 'Team 1',
    members: [
      {
        number: 399,
        ability: 1,
        moves: [1, 2, 8],
      }, // end of member 1
      {
        number: 129,
        ability: 0,
        moves: [3, 2, 1, 0],
      }, // end of member 2
    ], // end of members array
    id: 0,
  }, // end of team of index 0
}; // end of object

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

const getTeams = (request, response) => {
  // json object to respond with
  const obj = {
    teams,
  };

  // return with the respondJSON function
  return respondJSON(request, response, 200, obj);
};

// only returns a 200 code
const getTeamsMeta = (request, response) => respondMeta(request, response, 200);

// sends a single team or an error
const getTeam = (request, response, params) => {
  // sets default status
  let status = 400;

  // starts building the oject
  const obj = {};

  // parameter is missing (includes 0 check because 0 is falsey)
  if (!params.id && params.id !== 0) {
    obj.message = "The parameter 'id' is required.";
    obj.id = 'missingParams';
  // parameter is there, but the team isn't one that is real
  } else if (!teams[params.id]) {
    status = 400;
    obj.message = `There is no team with id ${params.id}.`;
    obj.id = 'badParams';
  // correct request
  } else {
    status = 200;
    obj.teams = {};

    // this will decrement every time that a pokemon is added to the teams part of the obj
    // This will let it check for when it's done and respond appropriately.
    obj.notDone = teams[params.id].members.length;

    // iterate through the team members and find their names using the Pokedex,
    // adding them to the object when they are found.
    for (let i = 0; i < teams[params.id].members.length; i++) {
      const member = teams[params.id].members[i];

      // gets all the pokemon and calls a callback function each time
      P.getPokemonByName(member.number, (res, error) => { // callback function
        if (!error) {
          // success, set the name
          obj.teams[i] = res.name;
        } else {
          // failed, give an error
          obj.teams[i] = error;
        }

        // decrement each time that one finishes
        obj.notDone -= 1;

        // respond when all the names have been recieved
        if (obj.notDone === 0) {
          respondJSON(request, response, status, obj);
        }
      });
    }

    return null;
  }

  // return with the respondJSON function
  return respondJSON(request, response, status, obj);
};

// only code depending on if the request would work or not
const getTeamMeta = (request, response, params) => {
  // sets default status
  let status = 200;

  // paramseter is missing (includes 0 check because 0 is falsey)
  // combines in the team check since the code is the same
  if ((!params.id && params.id === 0) || !teams[params.id]) {
    status = 400;
  }

  // return with the respondMeta function
  return respondMeta(request, response, status);
};

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
const postTeam = (request, response) => {
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
    const params = JSON.parse(data);

    // object including the message to send back
    const responseJSON = {
      message: 'Either a team name or at least one team member is required.',
    };

    // basically only a bad request if the user gives us nothing
    // we can allow empty teams
    // if a team is made we can allow it to be saved and make a default name
    if ((!params.name && !params.members) || (!params.name && params.members.count <= 0)) {
      responseJSON.id = 'missingParams';
      return respondJSON(request, response, 400, responseJSON);
    }

    // next default it to creating a new one
    let status = 201;

    // change code if it exists, id based for easy checking
    if (Object.prototype.hasOwnProperty.call(params, 'id')) {
      status = 204;
    } else {
      params.id = Object.keys(teams).length;
    }

    // either adds or updates
    teams[params.id] = params;

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
  getTeams,
  getTeamsMeta,
  getTeam,
  getTeamMeta,
  getNotFound,
  getNotFoundMeta,
  postTeam,
};
