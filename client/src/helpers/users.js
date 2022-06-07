import { addTeamsToStorage } from "./teams";

const users = [];

/** get a user by id
 * @param {number} userId user id
 * @returns user object
 */
export const getUserData = (userId) => users.find((u) => u.id === userId);

/** fetch user and add to user storage
 * @param {string} userId user id
 * @returns promise which fullfills into the user object
 */
export function fetchUserData(userId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "users/" + userId)
      .then((res) => res.json())
      .then((userRes) => {
        userRes.teams.forEach((team) => addTeamsToStorage(team));
        users.push(userRes);
        resolve(userRes);
      })
  );
}

/** fetch user and add to user storage
 * @param {string} userId user id
 * @returns promise which fullfills into the user object
 */
export function fetchUsersTeams(userId) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "usersTeams/" + userId)
      .then((res) => res.json())
      .then((userRes) => {
        userRes.teams.forEach((team) => addTeamsToStorage(team));
        users.push(userRes);
        resolve(userRes);
      })
  );
}

/** function to add users to the storage (only adds if user not in storage yet)
 * @param {[users]} newUsers array of users to add to the users array
 * @returns nothing
 */
export const addUsersToStorage = (newUsers) =>
  newUsers.forEach((user) => users.push(user));

export default users;
