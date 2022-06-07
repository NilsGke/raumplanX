import React, {
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import fetch from "sync-fetch";
import { CONFIG } from "../index";
import { AiOutlineClose } from "react-icons/ai";
import User from "./User";
import { addUsersToStorage } from "../helpers/users";
import { getTeamData } from "../helpers/teams";
import "../styles/addUserForm.scss";

const AddUserForm = forwardRef((props, ref) => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);

  const updateUsers = (name) => {
    searchString = name;
    if (name.length < CONFIG.minSearchLengh) {
      setUsers([]);
      return;
    }
    const urlToFetch = process.env.REACT_APP_BACKEND + "getUsersByName/" + name;
    const allUsers = process.env.REACT_APP_BACKEND + "users";
    const newUsers = (
      fetch(name !== "" ? urlToFetch : allUsers).json() || []
    ).map((user) => {
      return {
        ...user,
        teams: user.Organisationseinheiten.split(",")
          .map((team) => team.replace(": Seibert Media (SM)", "").trim())
          .filter((s) => s.length > 0)
          .map((teamName) => getTeamData(teamName)),
      };
    });
    setUsers(newUsers);
    addUsersToStorage(newUsers);
  };

  useImperativeHandle(ref, () => ({
    open,
    setOpen(bool) {
      setOpen(bool);
    },
  }));

  const inputRef = createRef();
  useEffect(() => {
    if (open) {
      inputRef.current.select();
    }
  }, [open, inputRef]);

  let searchString = "";

  let noData = "";
  if (searchString.length < CONFIG.minSearchLengh) {
    noData = (
      <div className="noData">
        Mindestens {CONFIG.minSearchLengh} Buchstaben eingeben...
      </div>
    );
  } else if (users.length === 0)
    noData = <div className="noData">Kein Mitarbeiter gefunden</div>;

  return (
    <>
      <div id="addUserFormBackground" className={open ? "open" : ""}></div>
      <div id="addUserForm" className={open ? "open" : ""}>
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div id="header">
            <input
              type="text"
              id="userNameInput"
              ref={inputRef}
              name="userNameInput"
              autoComplete="off"
              placeholder="Name..."
              onChange={(e) => {
                updateUsers(e.target.value);
              }}
            />
            <div id="closeButtonContainer">
              <button onClick={() => setOpen(false)}>
                <AiOutlineClose />
              </button>
            </div>
          </div>
          <div id="selectUser">
            {noData}
            {users.map((user, i) => {
              return (
                <User
                  key={user.id}
                  user={user}
                  deletable={false}
                  clickable={true}
                  getTeam={(name) => props.getTeam(name)}
                  clickHandler={(id) => {
                    props.addUser(id);
                    props.closePopup();
                  }}
                />
              );
            })}
          </div>
        </form>
      </div>
    </>
  );
});

AddUserForm.displayName = "AddUserForm";
export default AddUserForm;
