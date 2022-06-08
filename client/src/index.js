import React, { useEffect, useState, useCallback, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactDOM from "react-dom/client";
import ReactTooltip from "react-tooltip";
import Draggable from "react-draggable";

// components
import Table from "./components/Table";
import Tooltip from "./components/Tooltip";
import Calender from "./components/Calender";
import Teamlocation from "./components/Teamlocation";
import Room from "./components/Room";
import "./styles/index.scss";
import FloatingButtons from "./components/FloatingButtons";
import FeedbackPre from "./pages/FeedbackPre";
// helpers
import setColorTheme from "./helpers/theme";
import {
  addOrRefreshTables,
  createNewTable,
  deleteTable,
  getTableById,
  getTablesAtLocation,
} from "./helpers/tables";
const fetchSync = require("sync-fetch");

export const CONFIG = {
  reload: false,
  minSearchLengh: 0,
};

function importImages(r) {
  let images = {};
  r.keys().map((item, index) => {
    return (images[item.replace("./", "")] = r(item));
  });
  return images;
}

setColorTheme();

/**variable to hold locations*/
let locations = [];

export const MODIFIER_PREFIX =
  window.navigator.appVersion.indexOf("Mac") !== -1 ? "⌘" : "^";

const stored = JSON.parse(localStorage.getItem("raumplan"));
if (stored === undefined)
  localStorage.setItem("raumplan", JSON.stringify({ location: 3 }));

const loactionInUrl = parseInt(window.location.hash.replace("#", ""));

function App() {
  // location stuff
  const [locationId, setLocationId] = useState(
    loactionInUrl || stored?.location || 3
  );
  const [locationData, setLocationData] = useState(null);

  // tables
  const [tables, setTables] = useState(null);
  const [reloadTables, setReloadTables] = useState(true);

  // teams and rooms on the map
  const [teamlocations, setTeamlocations] = useState(null);
  const [rooms, setRooms] = useState(null);

  // move a table
  const [movingTable, setMovingTable] = useState(false);
  const [movingTableId, setMovingTableId] = useState(-1);
  const [movingTableNewPos, setMovingTableNewPos] = useState({
    x: 0,
    y: 0,
    r: 0,
  });
  const [movingTableOldPos, setMovingTableOldPos] = useState({
    x: 0,
    y: 0,
    r: 0,
  });

  // mini-tooltip (ex on floating buttons)
  const [hoverTooltopPosition, setHoverTooltopPosition] = useState("left");

  // highlighters
  const [highlightedRoom, setHighlightedRoom] = useState(null);
  const [highlightedTable, setHighlightedTable] = useState(null);
  const [highlightTimers, setHighlightTimers] = useState(0);

  // history
  const [history, setHistory] = useState([]);

  /**holds images of the building*/
  const images = importImages(
    require.context("./img", false, /\.(png|jpe?g|svg)$/)
  );

  const tooltipRef = useRef();
  const calenderRef = useRef();
  const floatingButtonsRef = useRef();

  // reload interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (CONFIG.reload) setReloadTables(true);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // location change
  useEffect(() => {
    const find = locations.find((l) => l.id === locationId);
    if (find === undefined) {
      fetch(process.env.REACT_APP_BACKEND + "locations/" + locationId)
        .then((res) => res.json())
        .then((data) => {
          locations.push(data);
          setLocationData(data);
        })
        .catch((err) => {
          console.error(err);
          changeLocation(
            locationId >= locations.length ? locationId - 1 : locationId + 1
          );
        });
    } else {
      setLocationData(find);
    }
  }, [locationId]);

  // change browser title and browser url
  useEffect(() => {
    document.title = "Raumplan: " + locationData?.name;
    if (locationData?.id)
      window.location.replace(
        window.location.origin +
          window.location.pathname +
          "#" +
          locationData?.id
      );
  }, [locationData]);

  // fetch rooms
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "rooms/" + locationId)
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch((err) => console.error(err));
  }, [locationData, locationId]);

  // fetch team locations
  useEffect(() => {
    if (locationData != null)
      fetch(process.env.REACT_APP_BACKEND + "teamlocations/" + locationId)
        .then((res) => res.json())
        .then((data) => setTeamlocations(data))
        .catch((err) => console.error(err));
  }, [locationData, locationId]);

  // fetching tables
  useEffect(() => {
    if (reloadTables) {
      if (locationData != null)
        addOrRefreshTables(locationId).then(() =>
          setTables(getTablesAtLocation(locationId))
        );
      setTimeout(() => {
        setReloadTables(false);
      }, 400);
    }
  }, [locationData, reloadTables, locationId]);

  // reset highlighted room after some time
  useEffect(() => {
    if (highlightedRoom !== null || highlightedTable !== null) {
      setHighlightTimers((prevState) => prevState + 1);
      setTimeout(() => {
        setHighlightTimers((prevState) => prevState - 1);
      }, 4000);
    }
  }, [highlightedRoom, highlightedTable]);

  // this is to wait for all the timers to finish, so the animation always runs the full amount
  useEffect(() => {
    if (highlightTimers === 0) {
      setHighlightedRoom(null);
      setHighlightedTable(null);
    }
  }, [highlightTimers]);

  /** function that sets up everything for the new location (deletes old tables and stuff)
   * @param {number} id id of the new location
   */
  const changeLocation = useCallback(
    (id) => {
      if (locationId === id) return;
      localStorage.setItem("raumplan", JSON.stringify({ location: id }));
      setMovingTable(false);
      tooltipRef.current.setVisible(false);
      setLocationId(id);
      setReloadTables(true);
    },
    [locationId]
  );

  /** saves the moved table to the db
   * @returns {Promise}
   */
  async function saveMovedTable() {
    return new Promise((resolve) => {
      fetch(process.env.REACT_APP_BACKEND + "moveTable", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          id: movingTableId,
          x: movingTableOldPos.x + movingTableNewPos.x,
          y: movingTableOldPos.y + movingTableNewPos.y,
          r: movingTableNewPos.r,
        }),
      })
        .then(() => {
          const tableId = movingTableId;
          const oldPos = {
            x: movingTableOldPos.x,
            y: movingTableOldPos.y,
            r: movingTableOldPos.r,
          };
          addToHistory({
            description: `Tisch: ${
              getTableById(movingTableId).tableNumber
            } verschoben`,
            undo: () => {
              fetch(process.env.REACT_APP_BACKEND + "moveTable", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  id: tableId,
                  x: oldPos.x,
                  y: oldPos.y,
                  r: oldPos.r,
                }),
              });
            },
          });
          setMovingTableNewPos();
        })
        .then(resolve);
    });
  }
  function resetMovingTable() {
    setMovingTable(false);
    setMovingTableId(-1);
    setMovingTableNewPos({ x: 0, y: 0, r: 0 });
    setMovingTableOldPos({ x: 0, y: 0, r: 0 });
  }

  function undo(length = 1) {
    return new Promise(async (resolve, reject) => {
      const historyTemp = history.slice();
      const actions = historyTemp.splice(-length, length);
      actions.forEach(async (action) => await action.undo());
      setHistory(historyTemp);
      setReloadTables(true);
      resolve();
    });
  }

  const addToHistory = useCallback(
    (obj) => {
      console.log("actually adding to history");
      setHistory([
        ...history,
        {
          ...obj,
          date: new Date(),
          id: history.map((h) => h.id).reduce((a, b) => a + b, 0) + 1,
        },
      ]);
    },
    [history]
  );

  // shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (e.altKey && e.ctrlKey) {
        // key combination
        switch (e.key) {
          case "f":
            floatingButtonsRef.current.openSearchmenu();
            e.preventDefault();
            break;
          case "l":
            floatingButtonsRef.current.openLocationDropdown();
            e.preventDefault();
            break;
          case ",":
            floatingButtonsRef.current.openSettings();
            e.preventDefault();
            break;
          case "n":
            createNewTable(locationId)
              .then((tableId) => {
                console.log("created table", tableId);
                addToHistory({
                  description: `Neuer Tisch erstellt (id: ${tableId})`,
                  undo: () =>
                    deleteTable(tableId).then(() => setReloadTables(true)),
                });
              })
              .then(() => setReloadTables(true));
            break;
          case "r":
            setReloadTables(true);
            e.preventDefault();
            break;
          default:
            break;
        }
      } else if (e.key === "Escape") {
        // escape key
        if (calenderRef.current.isOpen) calenderRef.current.closeCalender();
        else if (tooltipRef.current.addUserFormRef.current.open)
          tooltipRef.current.addUserFormRef.current.setOpen(false);
        else if (movingTable) resetMovingTable();
        else if (tooltipRef.current.isPopup)
          tooltipRef.current.setIsPopup(false);
        else if (tooltipRef.current.visible)
          tooltipRef.current.setVisible(false);
        else if (
          floatingButtonsRef.current.searchmenuRef.current.isOpen ||
          floatingButtonsRef.current.locationDropdownRef.current.isOpen ||
          floatingButtonsRef.current.historyRef.current.isOpen ||
          floatingButtonsRef.current.settingsRef.current.isOpen
        ) {
          floatingButtonsRef.current.clearButtonBorders();
          floatingButtonsRef.current.closeAll();
        } else if (floatingButtonsRef.current.toggledOpen) {
          floatingButtonsRef.current.setToggledOpen(false);
        }
      } else if (e.keyCode >= 37 && e.keyCode <= 40) {
        //arrow keys
        if (movingTable) {
          switch (e.keyCode) {
            case 37:
              // left
              setMovingTableNewPos({
                ...movingTableNewPos,
                x: movingTableNewPos.x - 1,
              });
              e.preventDefault();
              break;
            case 38:
              // up
              setMovingTableNewPos({
                ...movingTableNewPos,
                y: movingTableNewPos.y - 1,
              });
              e.preventDefault();
              break;
            case 39:
              // right
              setMovingTableNewPos({
                ...movingTableNewPos,
                x: movingTableNewPos.x + 1,
              });
              e.preventDefault();
              break;
            case 40:
              // down
              setMovingTableNewPos({
                ...movingTableNewPos,
                y: movingTableNewPos.y + 1,
              });
              e.preventDefault();
              break;
            default:
              break;
          }
        } else if (
          floatingButtonsRef.current.locationDropdownRef.current.isOpen
        ) {
          switch (e.keyCode) {
            case 38:
              // up
              changeLocation(locationId - 1);
              e.preventDefault();
              break;
            case 40:
              // down
              changeLocation(locationId + 1);
              e.preventDefault();
              break;
            default:
              break;
          }
        }
      }
    },
    [movingTable, locationId, addToHistory, changeLocation, movingTableNewPos]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      <ReactTooltip
        effect="solid"
        place={hoverTooltopPosition}
        offset={{ [hoverTooltopPosition]: 5 }}
      />
      <div id="app">
        <img src={images[locationData?.img] || ""} alt={"map"} id="map" />
        {teamlocations?.map((location, i) => (
          <Teamlocation
            key={i}
            openSearch={(s) => {
              floatingButtonsRef.current.openSearchmenu();
              floatingButtonsRef.current.searchmenuRef.current.setSearchString(
                s
              );
            }}
            data={location}
          />
        ))}

        {rooms?.map((room, i) => (
          <Room
            key={i}
            data={room}
            highlighted={room.name === highlightedRoom}
            openCalender={(data) => {
              calenderRef.current.openCalender(data);
              calenderRef.current.setData(data);
            }}
          />
        ))}

        {tables?.map((table, i) => {
          let draggableProps = {
            disabled: !(movingTable && table.id === movingTableId),
          };
          if (!draggableProps.disabled)
            draggableProps.position = { x: 0, y: 0 };

          return (
            <Draggable
              key={table.id}
              {...draggableProps}
              defaultPosition={{ x: 0, y: 0 }}
              onStop={(e, elem) => {
                setMovingTableNewPos({
                  x: movingTableNewPos.x + elem.x,
                  y: movingTableNewPos.y + elem.y,
                  r: movingTableNewPos.r,
                });
              }}
            >
              <div className="tableDraggable">
                <Table
                  highlighted={highlightedTable === table.id}
                  locationData={locationData}
                  data={table}
                  setTooltipVisible={(bool) =>
                    tooltipRef.current.setVisible(bool)
                  }
                  changeTooltipTable={(id) => tooltipRef.current.setTable(id)}
                  openPopup={() => tooltipRef.current.setIsPopup(true)}
                  moving={movingTable && table.id === movingTableId}
                  newPosition={movingTableNewPos}
                />
              </div>
            </Draggable>
          );
        })}
        <FloatingButtons
          ref={floatingButtonsRef}
          images={images}
          history={history}
          addToHistory={(item) => addToHistory(item)}
          undo={(am) => undo(am)}
          setReloadTables={() => setReloadTables(true)}
          highlightRoom={(name) => setHighlightedRoom(name)}
          highlightTable={(id) => setHighlightedTable(id)}
          currentLocation={locationId}
          changeLocation={(id) => changeLocation(id)}
          reloadTables={reloadTables}
          setHighlightedTable={(table) => setHighlightedTable(table)}
          setHighlightedRoom={(room) => setHighlightedRoom(room)}
          setHoverTooltopPosition={(pos) => setHoverTooltopPosition(pos)}
        />
        <Tooltip
          // edit users
          setReloadTables={() => setReloadTables(true)}
          updateTables={() => setReloadTables(true)}
          // move table
          currentlyMovingTable={movingTable}
          moveTable={(tableId, oldPos) => {
            setMovingTableNewPos({ x: 0, y: 0, r: oldPos.r });
            setMovingTableOldPos(oldPos);
            setMovingTableId(tableId);
            setMovingTable(true);
          }}
          spinTable={(degree) =>
            setMovingTableNewPos({
              x: movingTableNewPos.x,
              y: movingTableNewPos.y,
              r: degree,
            })
          }
          saveMovedTable={async () => {
            await saveMovedTable();
            setMovingTable(false);
            setMovingTableId(-1);
            setMovingTableNewPos({ x: 0, y: 0, r: 0 });
            setMovingTableOldPos({ x: 0, y: 0, r: 0 });
            setReloadTables(true);
          }}
          resetMovingTable={() => resetMovingTable()}
          setHoverTooltopPosition={(pos) => setHoverTooltopPosition(pos)}
          openSearch={(searchString) => {
            floatingButtonsRef.current.openSearchmenu();
            floatingButtonsRef.current.searchmenuRef.current.setSearchString(
              searchString
            );
          }}
          newRotation={movingTableNewPos.r}
          addToHistory={(obj) => addToHistory(obj)}
          ref={tooltipRef}
        />
        <Calender ref={calenderRef} />
      </div>
    </>
  );
}

const Router = () => {
  const counter = useRef(10);
  const [refreshTimer, setRefreshTimer] = useState(counter.current);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error === false)
      try {
        fetchSync(process.env.REACT_APP_BACKEND);
      } catch (err) {
        setError(err);
        console.error(error);
        setInterval(() => {
          counter.current -= 1;
          setRefreshTimer(counter.current);
        }, 1000);
      }
  }, [error]);

  useEffect(() => {
    if (refreshTimer <= 0) window.location.reload();
  }, [refreshTimer]);

  if (error !== false)
    return (
      <div id="error">
        <div className="errorMessage">
          <h1>No connection to backend</h1>
          <code id="error">{error.toString()}</code>
          <h4>Bitte den Admin kontaktieren!</h4>
          <h5>erneut versuchen: {counter.current}</h5>
        </div>
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} exact />
        <Route path="/feedback" element={<FeedbackPre />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Router />);
