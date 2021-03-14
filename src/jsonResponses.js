// creates the pokedex object

// https://github.com/PokeAPI/pokedex-promise-v2
const Pokedex = require('pokedex-promise-v2');

const P = new Pokedex();

// teams json object
const teams = {
  0: {
    name: 'Team 1',
    members: [
      {
        name: 'bidoof',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/399.png',
        number: 399,
        ability: 1,
        moves: [1, 2, 8],
      }, // end of member 1
      {
        name: 'magikarp',
        image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png',
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

const speciesSearch = (request, response, params) => {
  const status = 200;

  // sets the string that will be searched for in all pokemon names
  let searchString = '';
  if (params.q) searchString = decodeURIComponent(params.q).trim().toLowerCase();

  const obj = { type: 'speciesSearch' };

  P.getPokemonsList({ limit: 100000, offset: 0 }, (res, error) => {
    if (!error) {
      // filters it out so it's just an array of every name that includes what was searched for
      obj.results = res.results
        .map((species) => species.name)
        .filter((name) => name.includes(searchString));
      // write response
      respondJSON(request, response, status, obj);
    } else {
      // just act as if there were no matches
      obj.results = [];
      respondJSON(request, response, status, obj);
    }
  });
};

// the species search still always will give a success, as it just gives an empty array if it fails
const speciesSearchMeta = (request, response) => respondMeta(request, response, 200);

const getSpeciesData = (request, response, params) => {
  // sets default status
  let status = 400;

  // starts building the oject
  const obj = {};

  // parameter is missing (includes 0 check because 0 is falsey)
  if ((!params.id && params.id !== 0) || (!params.species && params.species !== 0)) {
    obj.message = "The parameters 'id' and 'species' are required.";
    obj.id = 'missingParams';
    // correct request
  } else {
    status = 200;
    obj.type = 'speciesData';
    obj.id = params.id;

    // newSpecies parameter is for if you need to reset all the values of the pokemon
    if (params.newSpecies) {
      obj.newSpecies = params.newSpecies;
    }

    // finds the species given
    P.getPokemonByName(params.species, (res, error) => { // callback function
      if (!error) {
        // success, set the object
        obj.data = res;
      } else {
        // failed, give an error
        obj.data = null;
      }
      respondJSON(request, response, status, obj);
    });
    return null;
  }

  return respondJSON(request, response, status, obj);
};

const getSpeciesDataMeta = (request, response, params) => {
  let status = 200;

  // parameter is missing (includes 0 check because 0 is falsey)
  if ((!params.id && params.id !== 0) || (!params.species && params.species !== 0)) {
    status = 400;
  }

  // return with the respondMeta function
  return respondMeta(request, response, status);
};

const getTeams = (request, response) => {
  // json object to respond with
  const obj = {
    teams,
    type: 'allTeams',
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
    obj.message = `There is no team with id ${params.id}.`;
    obj.id = 'badParams';
  // correct request
  } else {
    status = 200;
    obj.type = 'singleTeam';
    obj.members = {};
    obj.name = teams[params.id].name;
    obj.id = params.id;

    // this will decrement every time that a pokemon is added to the teams part of the obj
    // This will let it check for when it's done and respond appropriately.
    obj.notDone = teams[params.id].members.length;

    // special case for an empty team, respond immediately
    if (teams[params.id].members.length === 0) {
      respondJSON(request, response, status, obj);
    }

    // iterate through the team members and find their names using the Pokedex,
    // adding them to the object when they are found.
    for (let i = 0; i < teams[params.id].members.length; i++) {
      const member = teams[params.id].members[i];

      // gets all the pokemon and calls a callback function each time
      // the callback takes advantage of the closure of the for loop it's created within
      P.getPokemonByName(member.number, (res, error) => { // callback function
        if (!error) {
          const newMember = {};

          newMember.name = res.name; // sets the name
          newMember.image = res.sprites.other['official-artwork'].front_default; // sets the image
          if (member.ability || member.ability === 0) {
            newMember.ability = res.abilities[member.ability].ability.name; // sets the ability
          } else {
            newMember.ability = '';
          }
          newMember.moves = []; // sets the moves to empty
          // adds each move
          for (let j = 0; j < member.moves.length; j++) {
            newMember.moves[j] = res.moves[member.moves[j]].move.name;
          }
          // sets the values (the plain numbers)
          newMember.moveValues = member.moves;
          newMember.abilityValue = member.ability;
          newMember.number = member.number;

          // success, set the object
          obj.members[i] = newMember;
        } else {
          // failed, give an error
          obj.members[i] = null;
        }

        // decrement each time that one finishes
        obj.notDone -= 1;

        // respond when all the names have been recieved
        if (obj.notDone === 0) {
          respondJSON(request, response, status, obj);
        }
      });
    }
    return null; // return null, prevents bubbling but still waits for the rest to be done.
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

    // gives defaults to the name and members members will just be empty array
    if (!params.name) {
      params.name = 'New Team';
    } else if (!params.members || params.members.count <= 0) {
      params.members = [];
    }

    // next default it to creating a new one
    let status = 201;

    // change code if it exists, id based for easy checking
    // the second check is for if you try editing something and the server refreshes
    if ((params.id || params.id === 0) && params.id < Object.keys(teams).length) {
      status = 204;
    } else {
      params.id = Object.keys(teams).length;
    }

    // either adds or updates
    teams[params.id] = params;

    // sends the response for if it was created
    if (status === 201) {
      responseJSON.message = 'Created Successfully';
      responseJSON.type = 'create';
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
  getSpeciesData,
  getSpeciesDataMeta,
  speciesSearch,
  speciesSearchMeta,
};
