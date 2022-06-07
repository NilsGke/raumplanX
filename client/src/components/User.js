import React from "react";
import Team from "./Team";
import "../styles/user.scss";
// icons
import { BsTrashFill } from "react-icons/bs";

export default function User(props) {
  const teams = props.blueprint
    ? []
    : props.user.Organisationseinheiten.split(",").map((t) =>
        t.replace(": Seibert Media (SM)", "").trim()
      );

  if (props.blueprint)
    return (
      <div className="user">
        <h3>
          <span className="loadingText">name</span>
        </h3>
        <h4>
          <span className="loadingText">Anmeldename</span>
        </h4>
        <div
          className="teams"
          style={{
            gridTemplateColumns: teams.length > 2 ? "auto auto" : "auto",
          }}
        >
          <Team placeholder />
        </div>
      </div>
    );
  return (
    <div
      className="user"
      style={props.clickable ? { cursor: "pointer" } : {}}
      onClick={() => {
        if (props.clickable)
          props.clickHandler(props.user.id, props.user.Person);
      }}
    >
      <h3>{props.user.Person}</h3>
      {props.deletable ? (
        <div
          onClick={() => {
            props.deleteUser(props.user.id);
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
      <h4>{props.user.Anmeldename.toLowerCase()}</h4>
      <div
        className="teams"
        style={{
          gridTemplateColumns: teams.length > 2 ? "auto auto" : "auto",
        }}
      >
        {teams.map((teamName, i) => (
          <Team key={i} name={teamName} />
        ))}
      </div>
    </div>
  );
}
