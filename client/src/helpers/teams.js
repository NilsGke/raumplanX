/**variable to hold all teams*/
const teams = [];
export default teams;

/** get team by name
 * @param {string} teamName team name
 * @returns team object or undefined
 */
export const getTeamData = (teamName) => teams.find((t) => t.name === teamName);

/** fetches team
 * @param {string} teamName team name
 * @returns promise, which resolves into the team (or fake team if team cannot be found)
 */
export function fetchTeamData(teamName) {
  return new Promise((resolve, reject) =>
    fetch(process.env.REACT_APP_BACKEND + "teams/" + teamName)
      .then((res) => res.json())
      .then((data) => data[0])
      .then((team) => {
        teams.push(team);
        resolve(team);
      })
      .catch((error) => {
        // if team does not exist in db then error and add fake team data
        console.warn(
          `Could not find team: ${teamName}\nConsider adding it to the database!`
        );
        let team = { id: -1, name: teamName, color: "#1c1e26" };
        teams.push(team);
        resolve(team);
      })
  );
}

/**
 * function to add teams to the storage (only adds if team not in storage yet)
 * @param {[teamsobj]} newTeam array of teams to add to the teams array
 * @returns nothing
 */
export const addTeamsToStorage = (newTeam) => {
  if (!teams.find((team) => team.name === newTeam.name)) teams.push(newTeam);
};
