import { forwardRef, useImperativeHandle, useState } from "react";
import Toggle from "react-toggle";
import { CONFIG } from "..";
import "../styles/settings.scss";
import "react-toggle/style.css";
import { Link } from "react-router-dom";

const Settings = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    isOpen,
    setOpen(open) {
      setIsOpen(open);
    },
  }));

  return (
    <div id="settingsMenuContainer" className={isOpen ? "open" : ""}>
      <div id="settingsMenu">
        <div className="setting">
          <label>
            <Toggle
              defaultChecked={CONFIG.reload !== 0}
              icons={false}
              onChange={() => {
                CONFIG.reload = !CONFIG.reload;
                localStorage.setItem("config", JSON.stringify(CONFIG));
              }}
            />
            <span>Auto reload Tables</span>
          </label>
        </div>
        <div className="setting button">
          <Link to="/feedback">
            <button>Feedback</button>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default Settings;
