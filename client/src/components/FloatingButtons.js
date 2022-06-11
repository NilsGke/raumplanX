import { forwardRef, useState, useRef, useImperativeHandle } from "react";
import { useMediaQuery } from "react-responsive";
import { Squash as Hamburger } from "hamburger-react";
// components
import LocationDropdown from "./LocationDropdown";
import Searchmenu from "./Searchmenu";
import History from "./History";
// styles
import "../styles/floatingButtons.scss";
// icons
import { GrMapLocation } from "react-icons/gr";
import {
  AiOutlineReload,
  AiOutlineSearch,
  AiOutlineHistory,
} from "react-icons/ai";
import { IoMdAdd, IoMdSettings } from "react-icons/io";

import { MODIFIER_PREFIX } from "../";
import { createNewTable, deleteTable } from "../helpers/tables";
import Settings from "./Settings";

const FloatingButtons = forwardRef((props, ref) => {
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1000px)" });
  const [activeButton, setActiveButton] = useState("");

  const [toggledOpen, setToggledOpen] = useState(false);
  if (props.forceOpen) setToggledOpen(true);

  const locationDropdownRef = useRef();
  const searchmenuRef = useRef();
  const historyRef = useRef();
  const settingsRef = useRef();

  useImperativeHandle(ref, () => ({
    openSearchmenu() {
      closeAll();
      searchmenuRef.current.setOpen(true);
    },
    openLocationDropdown() {
      closeAll();
      locationDropdownRef.current.setOpen(true);
    },
    openHistory() {
      closeAll();
      historyRef.current.setOpen(true);
    },
    openSettings() {
      closeAll();
      settingsRef.current.setOpen(true);
    },
    searchmenuRef,
    locationDropdownRef,
    historyRef,
    settingsRef,
    clearButtonBorders() {
      setActiveButton("");
    },
    toggledOpen,
    setToggledOpen(bool) {
      setToggledOpen(bool);
    },
    closeAll() {
      closeAll();
    },
  }));

  const closeAll = () => {
    searchmenuRef.current.setOpen(false);
    locationDropdownRef.current.setOpen(false);
    historyRef.current.setOpen(false);
    settingsRef.current.setOpen(false);
  };

  return (
    <>
      <div
        id="floatingButtonsContainer"
        onMouseEnter={() => props.setHoverTooltopPosition("left")}
      >
        <div
          id="floatingButtons"
          className={isTabletOrMobile && !toggledOpen ? "hidden" : ""}
        >
          <div
            id="searchContainer"
            data-tip={`Suchen (${MODIFIER_PREFIX}+alt+f)`}
          >
            <button
              className="floatingButton"
              style={{
                border:
                  activeButton === "searchmenu" ? "2px solid #00beff" : "",
              }}
              onClick={() => {
                const opened = searchmenuRef.current.isOpen;
                closeAll();
                searchmenuRef.current.setOpen(!opened);
                setActiveButton(
                  !searchmenuRef.current.isOpen ? "searchmenu" : ""
                );
              }}
            >
              <AiOutlineSearch />
            </button>
          </div>
          <div
            id="changeLocationContainer"
            data-tip={`Location wechseln (${MODIFIER_PREFIX}alt+l)`}
          >
            <button
              className="floatingButton"
              style={{
                border:
                  activeButton === "locationDropdown"
                    ? "2px solid #00beff"
                    : "",
              }}
              onClick={() => {
                const opened = locationDropdownRef.current.isOpen;
                closeAll();
                locationDropdownRef.current.setOpen(!opened);
                setActiveButton(
                  !locationDropdownRef.current.isOpen ? "locationDropdown" : ""
                );
              }}
            >
              <GrMapLocation className="invert" />
            </button>
          </div>
          <div
            id="addTableContainer"
            data-tip={`Tisch hinzufügen (${MODIFIER_PREFIX}+alt+n)`}
          >
            <button
              className="floatingButton"
              onClick={() =>
                createNewTable(props.currentLocation)
                  .then((tableId) => {
                    props.setHighlightedTable(tableId);
                    props.addToHistory({
                      description: `Neuer Tisch erstellt (id: ${tableId})`,
                      undo: () =>
                        deleteTable(tableId).then(() =>
                          props.setReloadTables(true)
                        ),
                    });
                  })
                  .then(() => props.setReloadTables(true))
              }
            >
              <IoMdAdd />
            </button>
          </div>
          <div
            id="refreshButtonContainer"
            data-tip={`Reload (${MODIFIER_PREFIX}+alt+r)`}
          >
            <button
              className="floatingButton"
              style={{
                transform: props.reloadTables
                  ? "rotate(360deg)"
                  : "rotate(0deg)",
                transition: props.reloadTables
                  ? "transform .4s ease-in-out"
                  : "",
              }}
              onClick={(e) => props.setReloadTables(true)}
            >
              <AiOutlineReload />
            </button>
          </div>
          <div id="historyButtonContainer" data-tip="Verlauf">
            <button
              style={{
                border: activeButton === "history" ? "2px solid #00beff" : "",
              }}
              className="floatingButton"
              onClick={() => {
                const opened = historyRef.current.isOpen;
                closeAll();
                historyRef.current.setOpen(!opened);
                setActiveButton(!historyRef.current.isOpen ? "history" : "");
              }}
            >
              <AiOutlineHistory />
            </button>
          </div>
          <div id="settingsButtonContainer" data-tip="Einstellungen">
            <button
              style={{
                border: activeButton === "settings" ? "2px solid #00beff" : "",
              }}
              className="floatingButton"
              onClick={() => {
                const opened = settingsRef.current.isOpen;
                closeAll();
                settingsRef.current.setOpen(!opened);
                setActiveButton(!settingsRef.current.isOpen ? "settings" : "");
              }}
            >
              <IoMdSettings />
            </button>
          </div>
        </div>
        <button
          id="toggleButton"
          className={
            "floatingButton " + (isTabletOrMobile ? "visible" : "hidden")
          }
          style={{
            transform: `rotate(${toggledOpen ? 90 : 0}deg)`,
          }}
          onClick={() => {
            if (toggledOpen) {
              searchmenuRef.current.setOpen(false);
              locationDropdownRef.current.setOpen(false);
            }
            setToggledOpen(!toggledOpen);
          }}
        >
          <Hamburger toggled={toggledOpen} color="white" />
        </button>
        <LocationDropdown
          ref={locationDropdownRef}
          locations={props.locations}
          currentLocation={props.currentLocation}
          changeLocation={(id) => props.changeLocation(id)}
        />
        <Searchmenu
          ref={searchmenuRef}
          images={props.images}
          highlightRoom={(name) => props.setHighlightedRoom(name)}
          highlightTable={(id) => props.setHighlightedTable(id)}
          changeLocation={(id) => props.changeLocation(id)}
        />
        <History
          ref={historyRef}
          history={props.history}
          undo={(am) => props.undo(am)}
          reloadTables={() => props.setReloadTables(true)}
        />
        <Settings ref={settingsRef} />
      </div>
    </>
  );
});

FloatingButtons.displayName = "FloatingButtons";
export default FloatingButtons;
