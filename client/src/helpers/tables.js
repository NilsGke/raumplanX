let tableStorage = [];

/**
 * refreshes Tables
 * @param {number} locationid location id
 * @returns {Promise<void>}
 */
export function addOrRefreshTables(locationid) {
  // filter out all tables that do not have location != locationid
  const filteredTables = tableStorage.filter((t) => t.location !== locationid);
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "tables/" + locationid)
      .then((response) => response.json())
      .then((data) => data.forEach((table) => filteredTables.push(table)))
      .then(() => (tableStorage = filteredTables))
      .then(resolve)
      .catch(reject)
  );
}

/** gets the tables at a specific location
 * @param {number} locationid locaoitn id
 * @returns {Array<Object>} tables
 */
export function getTablesAtLocation(locationid) {
  return tableStorage.filter((table) => table.location === locationid);
}

/** gets the table with a specific id
 * @param {number} tableId table id
 * @returns {Object} table
 */
export function getTableById(tableId) {
  return tableStorage.find((table) => table.id === tableId);
}

/** create new table with values
 * @param {object} table table object
 * @returns {Promise<void>}
 */
export function createTableWithValues(table) {
  console.log(table);
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "addTableWithValues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table,
      }),
    })
      .then(resolve)
      .catch(reject)
  );
}

/** create new table
 * @param {number} locationId location id
 * @returns {Promise<void>}
 */
export function createNewTable(locationId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "addTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber: "",
        position: {
          x: Math.floor(Math.random() * 200) + 300,
          y: Math.floor(Math.random() * 100),
          r: 0,
        },
        user: [],
        location: locationId,
      }),
    })
      .then((res) => res.json())
      .then((data) => resolve(data.newId))
  );
}

/** feches users at table
 * @param {number} tableId table id
 * @returns {Promise<[users]>}
 */
export function fetchTablesUsers(tableId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "tablesUsers/" + tableId)
      .then((response) => response.json())
      .then((users) => {
        tableStorage.find((table) => table.id === tableId).users = users;
        resolve(users);
      })
      .catch(reject)
  );
}

/** function that changes the tables number (/name)
 * @param {number} tableId tables id
 * @param {string} newTableNumber table number (can also be letters, so its a string)
 */
export function changeTableNumber(tableId, newTableNumber, locationId) {
  //   return promise
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "changeTableNumber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tableId,
        tableNumber: newTableNumber,
      }),
    })
      .then(() => addOrRefreshTables(locationId).then(resolve))
      .catch(reject)
  );
}

/** sends request to backend to add a user to a table
 * @param {number} tableId table id
 * @param {number} userId user id
 * @param {number} locationId location id (tables will be reloaded)
 * @returns {Promise<void>}
 */
export function addUserToTable(tableId, userId, locationId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "addUserToTable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        tableId: tableId,
      }),
    })
      .then(() => addOrRefreshTables(locationId).then(resolve))
      .catch(reject)
  );
}

/** function that removes a user from a table in the db
 * @param {number} userId users id
 * @param {number} tableId tables id
 * @returns {Promise<void>}
 */
export function removeUserFromTable(userId, tableId, locationId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "removeUserFromTable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId,
        tableId,
      }),
    })
      .then(() => addOrRefreshTables(locationId).then(resolve))
      .catch(reject)
  );
}

/** sends a post request to delete a table from the db
 * @param {number} tableId table id
 * @returns {Promise<void>}
 */
export function deleteTable(tableId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "removeTable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: tableId,
      }),
    })
      .then(resolve)
      .catch(reject)
  );
}

const tables = () => tableStorage.slice();
export default tables;
