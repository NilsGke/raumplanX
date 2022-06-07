import { useState, useEffect } from "react";
import { getTeamData, fetchTeamData } from "../helpers/teams";
import "../styles/team.scss";

export default function Team(props) {
  const [team, setTeam] = useState(getTeamData(props.name));
  const [gotTeamData, setGotTeamData] = useState(getTeamData(props.name));

  useEffect(() => {
    if (team === undefined)
      fetchTeamData(props.name)
        .then((team) => setTeam(team))
        .then(() => setGotTeamData(true));
  }, [props.name, team]);

  if (!gotTeamData) return <div className="team placeholder">placeholder</div>;

  return (
    <div
      className="team"
      style={{
        background: team.color,
        color:
          parseInt(team.color.replace("#", ""), 16) > 0xffffff / 1.1
            ? "black"
            : "white",
      }}
    >
      {team.name}
    </div>
  );
}
