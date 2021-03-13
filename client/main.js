
//set in init, the respondstruct for the obj.type
let respondStruct;

const handleResponse = (xhr) => {
    //handles each code
    switch(xhr.status) {
        case 200://success
            console.log('Success');
        break;
        case 201: //create
            console.log('Create');
        break;
        case 204://returns as an updated will not give content to show
            console.log('Updated');
            return; 
        case 400:
            console.log('Bad Request');
        break;
        case 404:
            console.log('Resource Not Found');
        break;
        default:
            console.log('Error Not Implemented');
        break;
    }

    const obj = JSON.parse(xhr.response);

    //if the type is one that we can handle, do so
    if(obj.type && respondStruct[obj.type])
    {
        respondStruct[obj.type](obj);
    }
};

//handle all of the teams and lists them
const handleTeams = (obj) => {
    let teamFlex = document.querySelector("#teamFlex");
    teamFlex.innerHTML = ""; //it will say loading so we need to clear that

    //iterate through every team
    for(let i =0; i<Object.getOwnPropertyNames(obj.teams).length; i++) {
        //gets this team
        let teamObj = obj.teams[i];

        //create the team div
        let teamDiv = document.createElement("div");
        teamDiv.className = "team";
        teamDiv.id = teamObj.id;
        
        //create the team name
        let teamName = document.createElement("h2");
        teamName.textContent = teamObj.name;
        teamDiv.append(teamName);

        let innerTeam = document.createElement("div");
        innerTeam.className = "innerTeam";

        //iterates 6 times, once each possible team member
        //ones that don't exist will have an empty member created
        for(let j =0; j<6; j++) {
            //get the team member from the object
            let species = teamObj.members[j];

            //creates the team member
            let teamMember = document.createElement("div");
            teamMember.className = "teamMember";

            //if it exists then add it, if not make an empty spot
            if(species && species.image) {
                //gives it the image
                let image = document.createElement("img"); 
                image.src = species.image;
                image.alt = species.name;
                //appends the image
                teamMember.append(image);

                //gives it the name header
                let pokName = document.createElement("h3");
                pokName.textContent = species.name;
                //appends the name
                teamMember.append(pokName);
            } else {
                // http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif
                // http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
                //This is a very small gif file that will be used in place of a pokemon image if 
                //there isn't a pokemon in that slot of the team.
                let image = document.createElement("img"); 
                image.src = "http://probablyprogramming.com/wp-content/uploads/2009/03/handtinytrans.gif";
                image.alt = "Empty Slot";
                //width makes sure it's the same size as the other images (which are all 475x475)
                image.width = '475';
                //appends
                teamMember.append(image);
            }

            innerTeam.append(teamMember);
        }

        //appends everything when done
        teamDiv.append(innerTeam);
        teamFlex.append(teamDiv);
    }

    //makes the new team link and appends it
    let addLink = document.createElement("a");
    addLink.href="add.html";
    addLink.className="newTeam";
    addLink.textContent = "+";
    teamFlex.append(addLink);
}

const handleTeam = (obj) => {

}

//sends a get request with any url passed in
const sendGet = (url) => {
    const xhr = new XMLHttpRequest();

    xhr.open("get", url);

    xhr.setRequestHeader('Accept', 'application/json');

    //sets up load event
    xhr.onload = () => handleResponse(xhr);

    xhr.send();

    //stupidness due to being a form
    return false;
};

const sendPost = (e) => {
    //get if you're creating a new one (debug only)
    const newTeam = document.querySelector("#postSelect").value;

    const xhr = new XMLHttpRequest();

    xhr.open("post", "/postTeam");

    //sets headers for post
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json');

    //handles the response
    xhr.onload = () => handleResponse(xhr);

    //creates the data and sends it
    const jsonData = {
    name: "New Team",
    members: [
        {
        number: 400,
        ability: 0,
        moves: [1, 2, 8]
        }, //end of member 1
        {
        number: 130,
        ability: 1,
        moves: [3, 2, 1, 0]
        } //end member 1
    ] //end members
    }; //end json

    //id sets to 0 if you want to update the first one. Again, debug only stuff
    if(newTeam === "update") {
    jsonData.id = 0;
    jsonData.name = `Update number ${debugCounter}`;
    debugCounter++;
    }

    xhr.send(JSON.stringify(jsonData));

    //stupidness due to being a form
    e.preventDefault();
    return false;
};

const init = () => {
    //sets respondstruct for responding to different types of requests
    respondStruct = {
        "allTeams" : handleTeams,
        "singleTeam" : handleTeam,
    };

    //sends a request to get all the teams to display them
    document.querySelector("#teamFlex").innerHTML = "Loading..."
    sendGet("/getTeams");
};

window.onload = init;