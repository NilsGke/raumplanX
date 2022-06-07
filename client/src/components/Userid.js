import React, { useState, useEffect } from "react";
import "../styles/user.scss";
import Team from "./Team";
import { getUserData, fetchUserData } from "../helpers/users";
// icons
import { BsTrashFill } from "react-icons/bs";

export default function User(props) {
  const [user, setUser] = useState(getUserData(props.id));
  const [gotUserData, setGotUserData] = useState(user !== undefined);

  useEffect(() => {
    if (user?.Person === undefined)
      fetchUserData(props.id)
        .then((user) => setUser(user))
        .then(() => setGotUserData(true));
  }, [props.id, user?.Person]);

  const teams = gotUserData
    ? user.Organisationseinheiten.split(",").map((t) =>
        t.replace(": Seibert Media (SM)", "").trim()
      ) || []
    : [];

  if (!gotUserData)
    // if we havent got the user data yet, display a blueprint
    return (
      <div className="user blueprint">
        <h3 className="w1"> </h3>
        <h4 className="w2"> </h4>
        <div className="teams">
          <div
            className="team w3"
            style={{
              background: "grey",
              color: "white",
            }}
          >
            {" "}
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="user"
      style={props.clickable ? { cursor: "pointer" } : {}}
      onClick={() => {
        if (props.clickable) props.clickHandler(user);
      }}
    >
      <h3>{user.Person}</h3>
      {props.deletable ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            props.deleteUser(user.id);
          }}
          className="removeUserContainer"
        >
          <button className="removeUser">
            <BsTrashFill />
          </button>
        </div>
      ) : (
        ""
      )}
      <h4>{user.Anmeldename.toLowerCase()}</h4>
      <div
        className="teams"
        style={{
          gridTemplateColumns: teams.length > 2 ? "auto auto" : "auto",
        }}
      >
        {teams.map((teamName, i) => {
          return <Team key={i + teamName} name={teamName} />;
        })}
      </div>
    </div>
  );
}
