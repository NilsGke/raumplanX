// express setup
const express = require("express");
const router = express.Router();

// use environment variables
require("dotenv").config();

// sql setup
const mysql = require("mysql");
const db = mysql.createConnection({
  user: "tischplanUser",
  host: "localhost",
  password: process.env.DB_PASSWORD,
  database: "raumplan2",
});
db.connect((err) => {
  if (err) throw err;
  if (db.state === "connected")
    console.log(`connected to: ${db.config.database} as ${db.config.user}`);
});

// middleware that is specific to this router
router.use((req, res, next) => {
  next();
});
// define the home page route
router.get(["/", "ping"], (req, res) => res.sendStatus(200));

// serve locations data
router.get("/locations", (req, res) => {
  db.query("SELECT * FROM locations", [], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      res.send(result);
    } else {
      res.send({ message: "error while fetching database" });
    }
  });
});

// serve tables for only one location
router.get("/locations/*", (req, res) => {
  db.query(
    "SELECT * FROM locations WHERE id = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        res.send(result);
      } else {
        res.send({ message: "error while fetching database" });
      }
    }
  );
});

// serve one specific user
router.get("/users", (req, res) => {
  db.query("SELECT * FROM users", [], (err, response) => {
    if (err) res.send({ err });
    db.query("SELECT * FROM userteammap", [], (err, userTeams) => {
      if (err) res.send({ err });
      db.query("SELECT * FROM teams", [], (err, teams) => {
        let users = response.map((u) => ({ ...u, teams: [] }));
        if (err) res.send({ err });
        userTeams.forEach((userTeam) => {
          const userIndex = users.map((u) => u.id).indexOf(userTeam.user);
          users.at(userIndex).teams = [
            ...users.at(userIndex).teams,
            teams.find((t) => t.id === userTeam.team),
          ];
        });
        res.send(users);
      });
    });
  });
});

// serve one specific user
router.get("/users/*", (req, res) => {
  const userId = decodeURI(req.url).split("/").at(-1);
  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) res.send({ err: err });

    // query to get teams the user is in
    db.query(
      "SELECT * FROM teams WHERE id IN (SELECT team FROM userteammap WHERE user = ?)",
      [userId],
      (err, teams) => {
        if (err) res.send({ err: err });

        if (result.length > 0) {
          result[0].teams = teams;
          res.send(result[0]);
        } else {
          res.send({ message: "error while fetching database" });
        }
      }
    );
  });
});

// get users on table
router.get("/usersAtTable/*", (req, res) => {
  res.send(400);
  return;
  const tableId = decodeURI(req.url).split("/").at(-1);
  db.query(
    "SELECT * FROM users WHERE id IN (SELECT userId FROM tableusermap WHERE tableId = ?)",
    [tableId],
    (err, result) => {
      if (err) res.send({ err: err });

      Promise.all(
        result.map(
          (user) =>
            new Promise((resolve, reject) => {
              db.query(
                "SELECT * FROM teams WHERE id IN (SELECT team FROM userteammap WHERE user = ?)",
                [user.id],
                (err, teams) => {
                  if (err) reject(err);

                  user.teams = teams;
                  resolve(user);
                }
              );
            })
        )
      ).then((users) => res.send(users));
    }
  );
});

// get tables users
router.get("/tablesUsers", (req, res) => {
  db.query(
    "SELECT * FROM tableusermap",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) res.send({ err: err });
      res.send(result);
    }
  );
});

// get tables users
router.get("/tablesUsers/*", (req, res) => {
  db.query(
    "SELECT userId FROM tableusermap WHERE tableId = ?",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) res.send({ err: err });
      res.send(result.map((user) => user.userId));
    }
  );
});

// serve users by name
router.get("/getUsersByName/*", (req, res) => {
  const name = (
    decodeURI(req.url)
      .split("/")
      .at(-1)
      // .replace("%20", " ")
      .toUpperCase()
      .match(/([a-z]|\s)/gi) || []
  ).join("");
  db.query(
    "SELECT * FROM users WHERE UPPER(Person) LIKE ?",
    [name + "%"],
    (err, result) => {
      if (err && result) {
        res.send({ err: err });
      }

      if (result != undefined && result.length > 0) {
        res.send(result);
      } else {
        res.send([]);
      }
    }
  );
});

// serve tables for only one location
router.get("/tables/*", (req, res) => {
  db.query(
    "SELECT * FROM tables WHERE location = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err && result) res.send({ err: err });

      if (result != undefined && result.length > 0) res.send(result);
      else res.send([]);
    }
  );
});

// add user to table
router.post("/addUserToTable", (req, res) => {
  db.query(
    "INSERT INTO tableusermap (tableId, userId) VALUES (?, ?)",
    [req.body.tableId, req.body.userId],
    (err, result) => {
      if (err) res.send({ err: err });

      res.send(result);
    }
  );
});

// remove user from table
router.post("/removeUserFromTable", (req, res) => {
  db.query(
    "DELETE FROM tableusermap WHERE tableId = ? AND userId = ?",
    [req.body.tableId, req.body.userId],
    (err, result) => {
      if (err) res.send({ err: err });

      res.send(result);
    }
  );
});

// move table
router.post("/moveTable", (req, res) => {
  db.query(
    "UPDATE tables SET x = ?, y = ?, r = ? WHERE id = ?",
    [req.body.x, req.body.y, req.body.r, req.body.id],
    (err, results, fields) => {
      if (!err) res.sendStatus(200);
      else {
        console.log(err);
        res.send(err);
      }
    }
  );
});

// one team
router.get("/teams/*", (req, res) => {
  db.query(
    "SELECT * FROM teams WHERE name = ?",
    [decodeURI(req.url).split("/").at(-1).replace("%20", " ")],
    (err, result) => {
      if (err) res.send({ err: err });

      if (result.length > 0) res.send(result);
      else res.sendStatus(404);
    }
  );
});

// users teams
router.get("/usersTeams/*", (req, res) => {
  db.query(
    "SELECT * FROM teams WHERE id IN (SELECT team FROM userteammap WHERE user = ?)",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) res.send({ err: err });

      if (result.length > 0) res.send(result);
      else res.sendStatus(404);
    }
  );
});

// serve team locations for one locations
router.get("/teamlocations/*", (req, res) => {
  db.query(
    "SELECT * FROM teamlocations WHERE location = ?",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) res.send({ err: err });

      if (result.length > 0) res.send(result);
      else res.send([]);
    }
  );
});

// serve team locations for one location
router.get("/rooms/*", (req, res) => {
  db.query(
    "SELECT * FROM rooms WHERE location = ?",
    [req.url.split("/").at(-1)],
    (err, result) => {
      if (err) res.send({ err: err });

      if (result.length > 0) res.send(result);
      else res.send([]);
    }
  );
});

// search for stuff and return everything that matches with the search string
router.get("/search/*", (req, res) => {
  const search = mysql.escape(`%${decodeURI(req.url).split("/").at(-1)}%`);
  const results = {
    users: [],
    tables: [],
    teams: [],
    rooms: [],
    locations: [],
  };
  Promise.all([
    // users
    new Promise((resolve, reject) =>
      db.query(
        `SELECT *
          FROM users
          WHERE 
            Person Like ${search} 
            OR Organisationseinheiten Like ${search} 
            OR Person Like ${search} 
          `,
        [search],
        (err, res, fields) => {
          results.users = res;
          resolve();
        }
      )
    ),
    // tables
    new Promise((resolve, reject) =>
      db.query(
        `SELECT * FROM tables WHERE tableNumber LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.tables = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
    // teams
    new Promise((resolve, reject) =>
      db.query(
        `SELECT * FROM teams WHERE name LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.teams = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
    // rooms
    new Promise((resolve, reject) =>
      db.query(
        `SELECT * FROM rooms WHERE name LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.rooms = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
    // locations
    new Promise((resolve, reject) =>
      db.query(
        `SELECT name, img, id FROM locations WHERE name LIKE ${search}`,
        [search],
        (err, res, fields) => {
          results.locations = res.length > 0 ? res : [];
          resolve();
        }
      )
    ),
  ])
    .then(() => res.send(results))
    .catch((err) => console.log(err));
});

// get tables user is sitting at
router.get("/usersTables/*", (req, res) => {
  const search = mysql.escape(`%${decodeURI(req.url).split("/").at(-1)}%`);

  db.query(
    `SELECT * FROM tables WHERE id IN (SELECT tableId FROM tableusermap WHERE userId LIKE ${search})`,
    (err, result) => {
      if (err) res.send({ err: err });

      if (result.length > 0) res.send(result);
      else res.send([]);
    }
  );
});

// add table
router.post("/addTable", (req, res) => {
  // get free table id
  db.query("SELECT id FROM tables", [], (err, result) => {
    let id = 0;
    while (result.map((r) => r.id).includes(id)) id++;
    db.query(
      "INSERT INTO tables (id, tableNumber, x, y, r, user, location) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        req.body.tableNumber || "",
        req.body.position.x || 0,
        req.body.position.y || 0,
        req.body.position.r || 0,
        "",
        req.body.location,
      ],
      (err, results, fields) => {
        if (!err) res.send({ newId: id });
        else res.send({ err });
      }
    );
  });
});

// add table
router.post("/addTableWithValues", (req, res) => {
  // get free table id
  db.query("SELECT id FROM tables", [], (err, result) => {
    let id = 0;
    while (result.map((r) => r.id).includes(id)) id++;
    db.query(
      "INSERT INTO tables (id, tableNumber, x, y, r, user, location) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        req.body.table.tableNumber || "",
        req.body.table.x || 0,
        req.body.table.y || 0,
        req.body.table.r || 0,
        req.body.table.user,
        req.body.table.location,
      ],
      (err, results, fields) => {
        if (!err) res.sendStatus(200);
        else res.send({ err });
      }
    );
  });
});

// changeTableNumber table
router.post("/changeTableNumber", (req, res) => {
  if (req.body.id && req.body.tableNumber)
    db.query(
      `UPDATE tables
        SET tableNumber = ?
        WHERE id = ?`,
      [req.body.tableNumber, req.body.id],
      (err, results, fields) => {
        if (!err) res.sendStatus(200);
      }
    );
});

// reomve table
router.post("/removeTable", (req, res) => {
  db.query("DELETE FROM tables WHERE id = ?", [req.body.id], (err, result) => {
    if (!err) res.sendStatus(200);
    else res.send({ message: err });
  });
});

// update table
router.post("/updateTable", (req, res) => {
  const data = {
    id: 168,
    tableNumber: "",
    x: 461,
    y: 51,
    r: "0",
    user: [],
    location: 3,
  };

  db.query(
    "UPDATE tables SET tableNumber = ?, x = ?, y = ?, r = ?, user = ? WHERE id = ?",
    [
      req.body.tableNumber,
      req.body.x,
      req.body.y,
      req.body.r,
      req.body.user.join(";"),
      req.body.id,
    ],
    (err, result) => {
      if (!err) res.sendStatus(200);
      else res.send({ message: err });
    }
  );
});

// route to handle feedback given by user (name, email and message)
router.post("/submitFeedback", (req, res) => {
  const { name, email, message } = req.body;

  // TODO: send email to admin

  res.sendStatus(200);
});
function filterOutSemicolons(string) {
  // replace all double semicolons with single semicolons
  string = string.replace(/;;/g, ";");
  // remove all semicolons at the beginning of the string
  if (string.endsWith(";")) string = string.substr(0, string.length - 1);
  // remove all semicolons at the end of the string
  if (string.startsWith(";")) string = string.substr(1);
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
