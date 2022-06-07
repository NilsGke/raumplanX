import {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import Draggable from "react-draggable";

import User from "./Userid";
import AddUserForm from "./AddUserForm";

import "../styles/tooltip.scss";
// icons
import { BsTrashFill } from "react-icons/bs";
import { FiMove, FiCheck } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";
import {
  addUserToTable,
  changeTableNumber,
  createTableWithValues,
  deleteTable,
  fetchTablesUsers,
  getTableById,
  removeUserFromTable,
} from "../helpers/tables";
import { getUserData } from "../helpers/users";

const Tooltip = forwardRef((props, ref) => {
  const [visible, setVisibility] = useState(false);
  const [tableId, setTableId] = useState();
  const [table, setTable] = useState();
  const [isPopup, setIsPopup] = useState(false);

  const addUserFormRef = useRef();

  useEffect(() => {
    if (tableId !== undefined) setTable(getTableById(tableId));
  }, [tableId]);

  useEffect(() => {
    if (table?.users === undefined && tableId !== undefined)
      fetchTablesUsers(tableId).then((users) => setTable({ ...table, users }));
  }, [table, tableId]);

  const defaultValue = table?.tableNumber;
  const isDraggable = isPopup
    ? []
    : {
        position: {
          x: table?.x + 80 || 0,
          y: table?.y - 40 || 0,
        },
      };

  useImperativeHandle(ref, () => ({
    visible: visible,
    setVisible(value) {
      if (!isPopup) setVisibility(value);
    },
    setTable(id) {
      if (!isPopup) setTableId(id);
    },
    isPopup,
    setIsPopup(bool) {
      setIsPopup(bool);
    },
    addUserFormRef,
    tableId: tableId,
  }));

  const hideButton = props.currentlyMovingTable
    ? {
        height: 0,
        width: 0,
        overflow: "hidden",
      }
    : {};

  function users() {
    if (table === undefined) return;
    if (table.users === undefined)
      return (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>
      );
    if (table.users.length === 0)
      return (
        <div className="noUsers">
          <p>Keine Benutzer</p>
        </div>
      );
    return table.users.map((userId) => (
      <div key={userId} className="userContainer">
        <User
          id={userId}
          deletable={true}
          deleteUser={() =>
            removeUserFromTable(userId, tableId, table.location, true)
              .then(() => {
                props.addToHistory({
                  description: `${getUserData(userId).Person} von Tisch: ${
                    table.tableNumber
                  } gelöscht`,
                  date: new Date(),
                  undo: async () =>
                    await addUserToTable(tableId, userId, table.location),
                });
              })
              .then(() => setTable(getTableById(tableId)))
          }
          clickable={true}
          clickHandler={({ Person }) => {
            props.openSearch("user: " + Person);
          }}
        />
      </div>
    ));
  }

  return (
    <>
      <Draggable
        {...isDraggable}
        handle=".drag"
        cancel=".noDragHere"
        defaultClassNameDragging="dragging"
        bounds="parent"
      >
        <div
          // id="tooltip"
          className={"drag " + (isPopup ? "popup" : "")}
          {...{ id: "tooltip" }}
          style={{
            zIndex: isPopup || visible ? 2 : -1,
            position: isPopup ? "fixed" : "relative",
            transform: isPopup ? "translate(-50%, -50%)" : "",
            transitionDelay: visible ? "" : " .1s",
            opacity: isPopup || visible ? 1 : 0,
          }}
          onMouseEnter={() => setVisibility(true)}
          onMouseLeave={() => setVisibility(false)}
        >
          <form
            action=""
            onSubmit={(e) => {
              e.target.children[0].blur();
              e.preventDefault();
            }}
            key={defaultValue}
          >
            <input
              type="text"
              id="tableNumber"
              className="noDragHere"
              defaultValue={defaultValue}
              autoComplete="off"
              disabled={!isPopup}
              onBlur={(e) => {
                changeTableNumber(
                  table?.id,
                  e.target.value,
                  table.location
                ).then(() => props.setReloadTables());
                props.addToHistory({
                  description: `Tisch: "${table.tableNumber}" zu "${e.target.value}" umbenannt`,
                  undo: () => {
                    changeTableNumber(
                      table.id,
                      defaultValue,
                      table.location
                    ).then(() => props.setReloadTables());
                  },
                });
                e.preventDefault();
              }}
            />
          </form>
          <div
            id="editButtonContainer"
            className="noDragHere"
            data-tip={"Bearbeiten"}
            // onMouseOver={() => props.setHoverTooltopPosition("left")}
          >
            <button
              onClick={() => setIsPopup(true)}
              // onTouchStart={() => props.openPopup()}
              className="noDragHere"
            >
              <FaEdit />
            </button>
          </div>
          <div id="closeButtonContainer">
            <button
              onClick={() => setIsPopup(false)}
              className="noDragHere"
              style={hideButton}
            >
              <AiOutlineClose />
            </button>
          </div>
          <div
            key={table?.r}
            id="inputs"
            className={
              "noDragHere " + (props.currentlyMovingTable ? "" : "hidden")
            }
          >
            <h3>Tisch drehen / verschieben</h3>
            <h4>{props.newRotation || table?.r}°</h4>
            <div id="rotateTableInput" className="noDragHere">
              <button
                className="noDragHere"
                onClick={() => {
                  if (props.newRotation === 0) return;
                  props.spinTable(props.newRotation - 1);
                }}
              >
                −
              </button>
              <input
                className="noDragHere"
                type="range"
                defaultValue={props.newRotation || table?.r}
                name="posRinput"
                id="posR"
                min={0}
                max={360}
                onChange={(e) => props.spinTable(parseInt(e.target.value))}
              />
              <button
                className="noDragHere"
                onClick={() => {
                  if (props.newRotation === 360) return;
                  props.spinTable(props.newRotation + 1);
                }}
              >
                +
              </button>
            </div>
            <h5>Schiebe den Tisch mit der Maus oder den Pfeiltasten</h5>
          </div>
          <div
            id="usersContainer"
            className={
              "noDragHere" + (props.currentlyMovingTable ? " hidden" : "")
            }
            style={{
              gridTemplateColumns:
                (table?.users?.length || 1) > 1 ? "auto auto" : "auto",
              width:
                (table?.users?.length || 1) < 2
                  ? 250
                  : (table?.users?.length || 1) > 4
                  ? 600
                  : 420,
              justifyContent:
                (table?.users?.length || 1) < 3 ? "center" : "flex-start",
            }}
          >
            {users()}
          </div>
          <div
            id="controls"
            className="noDragHere"
            onMouseOver={() => props.setHoverTooltopPosition("bottom")}
          >
            <button
              id="add"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => addUserFormRef.current.setOpen(true)}
              data-tip={"Person hinzufügen"}
            >
              <HiUserAdd />
            </button>
            <button
              id="save"
              className={!props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.saveMovedTable()}
              data-tip={"Speichern"}
            >
              <FiCheck />
            </button>
            <button
              id="move"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() =>
                props.moveTable(table?.id, {
                  x: table.x,
                  y: table.y,
                  r: table.r,
                })
              }
              data-tip="verschieben / drehen"
            >
              <FiMove />
            </button>
            <button
              id="reset"
              className={!props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => props.resetMovingTable()}
              data-tip={"Abbrechen"}
            >
              <GrPowerReset />
            </button>
            <button
              id="delete"
              className={props.currentlyMovingTable ? "hidden " : ""}
              onClick={() => {
                if (!window.confirm("Tisch wirklich löschen?")) return;
                props.addToHistory({
                  description: `Tisch: "${table.tableNumber}" gelöscht`,
                  undo: () => {
                    createTableWithValues(table);
                  },
                });
                deleteTable(table.id);
                setIsPopup(false);
                props.updateTables();
              }}
              data-tip={"Löschen"}
            >
              <BsTrashFill />
            </button>
          </div>
        </div>
      </Draggable>
      <AddUserForm
        ref={addUserFormRef}
        addUser={(userId) =>
          addUserToTable(tableId, userId, table.location, true)
            .then(() => {
              props.addToHistory({
                description: `"${
                  getUserData(userId).Person
                }" zu "${getTableById(tableId)}" hinzugefügt`,
                date: new Date(),
                undo: async () =>
                  await removeUserFromTable(userId, tableId, table.location),
              });
            })
            .then(() => setTable(getTableById(tableId)))
        }
        getTeam={(name) => props.getTeam(name)}
        closePopup={() => {
          addUserFormRef.current.setOpen(false);
          props.updateTables();
        }}
      />
    </>
  );
});

Tooltip.displayName = "Tooltip";
export default Tooltip;
