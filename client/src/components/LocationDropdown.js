import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import "../styles/locationDropdown.scss";
const fetchSync = require("sync-fetch");

let allLocations = [];
let gotAllLocations = false;

const LocationDropdown = forwardRef((props, ref) => {
  // state if dropdown is open or not
  const [isOpen, setIsOpen] = React.useState(false);

  if (isOpen && !gotAllLocations) {
    allLocations = fetchSync(
      process.env.REACT_APP_BACKEND + "locations/"
    ).json();
    gotAllLocations = true;
  }

  // imparitive handle for the dropdown
  useImperativeHandle(ref, () => ({
    isOpen,
    setOpen(open) {
      setIsOpen(open);
    },
  }));

  const useFocus = () => {
    const htmlElRef = useRef(null);
    const setFocus = () => {
      htmlElRef.current && htmlElRef.current.focus();
    };

    return [htmlElRef, setFocus];
  };
  const [inputRef, setInputFocus] = useFocus();

  useEffect(setInputFocus);

  return (
    <div id="locationDropdownContainer" className={isOpen ? "open" : ""}>
      <div id="locationDropdown">
        {(allLocations || []).map((l, i) => {
          let focusRef;
          if (isOpen && props.currentLocation === i)
            focusRef = { ref: inputRef };
          return (
            <button
              key={i}
              className={
                "location " + (props.currentLocation === i ? "current" : "")
              }
              {...focusRef}
              onClick={() => props.changeLocation(i)}
            >
              {l.name}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default LocationDropdown;
