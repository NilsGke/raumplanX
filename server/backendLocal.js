import express, { json } from "express";
import cors from "cors";
const app = express();
require("dotenv").config();
import { readFileSync, writeFileSync } from "fs";
const port = process.env.PORT || 3001;

app.use(json());
app.use(cors());

app.get(["", "/ping"], (req, res) => res.sendStatus("200"));

// serve locations data
app.get("/locations", (req, res) =>
  res.send(JSON.parse(readFileSync("./data/locations.json").toString()))
);

// serve tables for only one location
app.get("/locations/*", (req, res) => {
  const location = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(readFileSync("./data/locations.json").toString()).filter(
      (loc) => loc.id === location
    )
  );
});

// serve one specific user
app.get("/users", (req, res) => {
  res.send(JSON.parse(readFileSync("./data/users.json").toString()));
});

// serve one specific user
app.get("/users/*", (req, res) => {
  const userId = decodeURI(req.url).split("/").at(-1).replace("%20", " ");
  res.send(
    JSON.parse(readFileSync("./data/users.json").toString()).filter(
      (u) => u.id === userId
    )
  );
});

// serve users by name
app.get("/getUsersByName/*", (req, res) => {
  const name = (
    decodeURI(req.url)
      .split("/")
      .at(-1)
      .toUpperCase()
      .match(/([a-z]|\s)/gi) || []
  ).join("");

  res.send(
    JSON.parse(readFileSync("./data/users.json").toString()).filter((u) =>
      u.Person.toUpperCase().includes(name)
    )
  );
});

// serve tables for only one location
app.get("/tables/*", (req, res) => {
  const location = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(readFileSync("./data/tables.json").toString()).filter(
      (table) => table.location === location
    )
  );
});

// add user to table
app.post("/addUserToTable", (req, res) => {
  const tables = JSON.parse(readFileSync("./data/tables.json").toString());
  const tableIndex = tables.map((t) => t.id).indexOf(req.body.tableId);
  tables[tableIndex].user = filterOutSemicolons(
    tables[tableIndex].user + ";" + req.body.userId
  );

  writeFileSync("./data/tables.json", JSON.stringify(tables, null, 2));

  res.sendStatus(200);
});

// remove user from table
app.post("/removeUserFromTable", (req, res) => {
  const tables = JSON.parse(readFileSync("./data/tables.json").toString());
  const tableIndex = tables.map((t) => t.id).indexOf(req.body.tableId);
  tables[tableIndex].user = filterOutSemicolons(
    tables[tableIndex].user.replace(req.body.userId, "")
  );

  writeFileSync("./data/tables.json", JSON.stringify(tables, null, 2));

  res.sendStatus(200);
});

// move table
app.post("/moveTable", (req, res) => {
  const tables = JSON.parse(readFileSync("./data/tables.json").toString());
  const tableIndex = tables.map((t) => t.id).indexOf(req.body.id);
  tables[tableIndex] = {
    ...tables[tableIndex],
    x: req.body.x,
    y: req.body.y,
    r: req.body.r,
  };

  writeFileSync("./data/tables.json", JSON.stringify(tables, null, 2));

  res.sendStatus(200);
});

// one team
app.get("/teams/*", (req, res) => {
  const teamName = decodeURI(req.url).split("/").at(-1).replace("%20", " ");
  const team = JSON.parse(readFileSync("./data/teams.json").toString()).find(
    (team) => team.name === teamName
  );
  if (team === undefined) return res.sendStatus(404);
  res.send([team]);
});

// serve team locations for one locations
app.get("/teamlocations/*", (req, res) => {
  const searchLocation = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(readFileSync("./data/teamlocations.json").toString()).filter(
      (teamlocation) => teamlocation.location === searchLocation
    )
  );
});

// serve team locations for one location
app.get("/rooms/*", (req, res) => {
  const location = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(readFileSync("./data/rooms.json").toString()).filter(
      (room) => room.location === location
    )
  );
});

// search for stuff and return everything that matches with the search string
app.get("/search/*", (req, res) => {
  const search = decodeURI(req.url).split("/").at(-1).toLowerCase();
  const results = {
    users: JSON.parse(readFileSync("./data/users.json").toString()).filter(
      (user) =>
        user.Person.toLowerCase().includes(search) ||
        user.Organisationseinheiten.toLowerCase().includes(search)
    ),
    tables: JSON.parse(readFileSync("./data/tables.json").toString()).filter(
      (table) => table.tableNumber.toLowerCase().includes(search)
    ),
    teams: JSON.parse(readFileSync("./data/teams.json").toString()).filter(
      (team) => team.name.toLowerCase().includes(search)
    ),
    rooms: JSON.parse(readFileSync("./data/rooms.json").toString()).filter(
      (room) => room.name.toLowerCase().includes(search)
    ),
    locations: JSON.parse(
      readFileSync("./data/locations.json").toString()
    ).filter((location) => location.name.toLowerCase().includes(search)),
  };

  res.send(results);
});

// get tables user is sitting at
app.get("/usersTables/*", (req, res) => {
  const search = decodeURI(req.url).split("/").at(-1);

  const tables = JSON.parse(
    readFileSync("./data/tables.json").toString()
  ).filter((table) => table.user.includes(search));

  res.send(tables);
});

// add table
app.post("/addTable", (req, res) => {
  const tables = JSON.parse(readFileSync("./data/tables.json").toString());
  let newId = 0;
  while (tables.map((t) => t.id).includes(newId)) newId++;

  tables.push({
    id: newId,
    tableNumber: "",
    x: req.body.position.x || 0,
    y: req.body.position.y || 0,
    r: req.body.position.r || 0,
    user: "",
    location: req.body.location,
  });

  writeFileSync("./data/tables.json", JSON.stringify(tables, null, 2));

  res.sendStatus(200);
});

// changeTableNumber table
app.post("/changeTableNumber", (req, res) => {
  if (req.body.id && req.body.tableNumber) {
    const tables = JSON.parse(readFileSync("./data/tables.json").toString());
    const tableIndex = tables.map((t) => t.id).indexOf(req.body.id);
    tables[tableIndex] = {
      ...tables[tableIndex],
      tableNumber: req.body.tableNumber,
    };
    writeFileSync("./data/tables.json", JSON.stringify(tables, null, 2));
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// reomve table
app.post("/removeTable", (req, res) => {
  const tables = JSON.parse(readFileSync("./data/tables.json").toString());
  const newTables = tables.filter((table) => table.id !== req.body.id);

  writeFileSync("./data/tables.json", JSON.stringify(newTables, null, 2));

  res.sendStatus(200);
});

function filterOutSemicolons(string) {
  while (string.includes(";;")) string = string.replace(";;", ";"); // if (while removing a userId) there are two semicolons after each other, remove them
  string = string.replace(/^;+/, "").replace(/;+$/, ""); // removes trailing and leading semicolons
  return string;
}

app.listen(port, () => {
  console.log("running on port: " + port);
  console.log("this server is using local json files to store data");
});
