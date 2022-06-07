// express setup
const express = require("express");
const router = express.Router();

// use environment variables
require("dotenv").config();

const fs = require("fs");

// middleware that is specific to this router
router.use((req, res, next) => {
  next();
});

router.get(["", "/ping"], (req, res) => res.sendStatus("200"));

// serve locations data
router.get("/locations", (req, res) =>
  res.send(
    JSON.parse(fs.readFileSync("./server/data/locations.json").toString())
  )
);

// serve tables for only one location
router.get("/locations/*", (req, res) => {
  const location = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(
      fs.readFileSync("./server/data/locations.json").toString()
    ).filter((loc) => loc.id === location)
  );
});

// serve one specific user
router.get("/users", (req, res) => {
  res.send(JSON.parse(fs.readFileSync("./server/data/users.json").toString()));
});

// serve one specific user
router.get("/users/*", (req, res) => {
  const userId = decodeURI(req.url).split("/").at(-1).replace("%20", " ");
  res.send(
    JSON.parse(fs.readFileSync("./server/data/users.json").toString()).filter(
      (u) => u.id === userId
    )
  );
});

// serve users by name
router.get("/getUsersByName/*", (req, res) => {
  const name = (
    decodeURI(req.url)
      .split("/")
      .at(-1)
      .toUpperCase()
      .match(/([a-z]|\s)/gi) || []
  ).join("");

  res.send(
    JSON.parse(fs.readFileSync("./server/data/users.json").toString()).filter(
      (u) => u.Person.toUpperCase().includes(name)
    )
  );
});

// serve tables for only one location
router.get("/tables/*", (req, res) => {
  const location = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(fs.readFileSync("./server/data/tables.json").toString()).filter(
      (table) => table.location === location
    )
  );
});

// add user to table
router.post("/addUserToTable", (req, res) => {
  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  );
  const tableIndex = tables.map((t) => t.id).indexOf(req.body.tableId);
  tables[tableIndex].user = filterOutSemicolons(
    tables[tableIndex].user + ";" + req.body.userId
  );

  fs.writeFileSync(
    "./server/data/tables.json",
    JSON.stringify(tables, null, 2)
  );

  res.sendStatus(200);
});

// remove user from table
router.post("/removeUserFromTable", (req, res) => {
  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  );
  const tableIndex = tables.map((t) => t.id).indexOf(req.body.tableId);
  tables[tableIndex].user = filterOutSemicolons(
    tables[tableIndex].user.replace(req.body.userId, "")
  );

  fs.writeFileSync(
    "./server/data/tables.json",
    JSON.stringify(tables, null, 2)
  );

  res.sendStatus(200);
});

// move table
router.post("/moveTable", (req, res) => {
  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  );
  const tableIndex = tables.map((t) => t.id).indexOf(req.body.id);
  tables[tableIndex] = {
    ...tables[tableIndex],
    x: req.body.x,
    y: req.body.y,
    r: req.body.r,
  };

  fs.writeFileSync(
    "./server/data/tables.json",
    JSON.stringify(tables, null, 2)
  );

  res.sendStatus(200);
});

// one team
router.get("/teams/*", (req, res) => {
  const teamName = decodeURI(req.url).split("/").at(-1).replace("%20", " ");
  const team = JSON.parse(
    fs.readFileSync("./server/data/teams.json").toString()
  ).find((team) => team.name === teamName);
  if (team === undefined) return res.sendStatus(404);
  res.send([team]);
});

// serve team locations for one locations
router.get("/teamlocations/*", (req, res) => {
  const searchLocation = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(
      fs.readFileSync("./server/data/teamlocations.json").toString()
    ).filter((teamlocation) => teamlocation.location === searchLocation)
  );
});

// serve team locations for one location
router.get("/rooms/*", (req, res) => {
  const location = parseInt(
    decodeURI(req.url).split("/").at(-1).replace("%20", " ")
  );
  res.send(
    JSON.parse(fs.readFileSync("./server/data/rooms.json").toString()).filter(
      (room) => room.location === location
    )
  );
});

// search for stuff and return everything that matches with the search string
router.get("/search/*", (req, res) => {
  const search = decodeURI(req.url).split("/").at(-1).toLowerCase();
  const results = {
    users: JSON.parse(
      fs.readFileSync("./server/data/users.json").toString()
    ).filter(
      (user) =>
        user.Person.toLowerCase().includes(search) ||
        user.Organisationseinheiten.toLowerCase().includes(search)
    ),
    tables: JSON.parse(
      fs.readFileSync("./server/data/tables.json").toString()
    ).filter((table) => table.tableNumber.toLowerCase().includes(search)),
    teams: JSON.parse(
      fs.readFileSync("./server/data/teams.json").toString()
    ).filter((team) => team.name.toLowerCase().includes(search)),
    rooms: JSON.parse(
      fs.readFileSync("./server/data/rooms.json").toString()
    ).filter((room) => room.name.toLowerCase().includes(search)),
    locations: JSON.parse(
      fs.readFileSync("./server/data/locations.json").toString()
    ).filter((location) => location.name.toLowerCase().includes(search)),
  };

  res.send(results);
});

// get tables user is sitting at
router.get("/usersTables/*", (req, res) => {
  const search = decodeURI(req.url).split("/").at(-1);

  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  ).filter((table) => table.user.includes(search));

  res.send(tables);
});

// add table
router.post("/addTableWithValues", (req, res) => {
  // get free table id

  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  );
  let newId = 0;
  while (tables.map((t) => t.id).includes(newId)) newId++;

  tables.push({
    ...req.body.table,
    id: newId,
  });

  fs.writeFileSync(
    "./server/data/tables.json",
    JSON.stringify(tables, null, 2)
  );

  if (!err) res.sendStatus(200);
  else res.send({ err });
});

// add table
router.post("/addTable", (req, res) => {
  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  );
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

  fs.writeFileSync(
    "./server/data/tables.json",
    JSON.stringify(tables, null, 2)
  );

  res.sendStatus(200);
});

// changeTableNumber table
router.post("/changeTableNumber", (req, res) => {
  if (req.body.id && req.body.tableNumber) {
    const tables = JSON.parse(
      fs.readFileSync("./server/data/tables.json").toString()
    );
    const tableIndex = tables.map((t) => t.id).indexOf(req.body.id);
    tables[tableIndex] = {
      ...tables[tableIndex],
      tableNumber: req.body.tableNumber,
    };
    fs.writeFileSync(
      "./server/data/tables.json",
      JSON.stringify(tables, null, 2)
    );
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// reomve table
router.post("/removeTable", (req, res) => {
  const tables = JSON.parse(
    fs.readFileSync("./server/data/tables.json").toString()
  );
  const newTables = tables.filter((table) => table.id !== req.body.id);

  fs.writeFileSync(
    "./server/data/tables.json",
    JSON.stringify(newTables, null, 2)
  );

  res.sendStatus(200);
});

function filterOutSemicolons(string) {
  while (string.includes(";;")) string = string.replace(";;", ";"); // if (while removing a userId) there are two semicolons after each other, remove them
  string = string.replace(/^;+/, "").replace(/;+$/, ""); // removes trailing and leading semicolons
  return string;
}

function at(n) {
  // ToInteger() abstract op
  n = Math.trunc(n) || 0;
  // Allow negative indexing from the end
  if (n < 0) n += this.length;
  // OOB access is guaranteed to return undefined
  if (n < 0 || n >= this.length) return undefined;
  // Otherwise, this is just normal property access
  return this[n];
}

const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
  Object.defineProperty(C.prototype, "at", {
    value: at,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

module.exports = router;
