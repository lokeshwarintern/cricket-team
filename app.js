const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        * 
    FROM 
        cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getIdQuery = `
    SELECT 
        * 
    FROM 
        cricket_team 
    WHERE 
        player_id = ${playerId}        
    ;`;
  const players = await database.get(getIdQuery);
  response.send(convertDbObjectToResponseObject(players));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_id, player_name, jersey_num } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO 
        cricket_team (player_id,player_name,jersey_num)
    VALUES     
        (
            '${player_id}',
            '${player_name}',
            '${jersey_num}',
            
        );
    `;
  const dbResponse = await database.run(addPlayerQuery);
  request.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatedQuery = `
        UPDATE
            cricket_team 
        SET 
            player_name = '${playerName}',
            jersey_num = '${jerseyNumber}',
            role = '${role}'
        WHERE 
            player_id = ${playerId}    
    ;`;
  await database.run(updatedQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletedQuery = `
        DELETE FROM 
            cricket_team 
        WHERE 
            player_id = ${playerId}  

    
    ;`;
  await database.run(deletedQuery);
  response.send("Player Removed");
});

module.exports = app;
