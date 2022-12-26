const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};

initializerDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET Players
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
        SELECT * FROM cricket_team ORDER BY player_id;
    `;
  const playersArray = await db.all(getAllPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Add Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES(
            '${playerName}',
            '${jerseyNumber}',
            '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team WHERE player_id = '${playerId}';
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//Update a player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE 
        cricket_team
        SET 
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}'
        WHERE player_id = '${playerId}';
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM 
            cricket_team
        WHERE player_id = '${playerId}';
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
