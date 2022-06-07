import { forwardRef, useImperativeHandle, useState } from "react";
import "../styles/history.scss";

const History = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(-1);
  // imparitive handle for the dropdown
  useImperativeHandle(ref, () => ({
    isOpen,
    setOpen(open) {
      setIsOpen(open);
    },
  }));

  return (
    <div id="historyPopupContainer" className={isOpen ? "open" : ""}>
      <div id="historyPopup">
        {props.history.length > 0 ? (
          props.history
            .slice()
            .reverse()
            .map((h, i) => {
              return (
                <div
                  key={h.id}
                  className={"item" + (hovered >= i ? " hover" : "")}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(-1)}
                  onClick={() => props.undo(i + 1).then(() => setHovered(-1))}
                >
                  <div className="timeStamp">
                    {h.date.toLocaleTimeString("DE-de", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="description">{h.description}</div>
                </div>
              );
            })
        ) : (
          <div className="empty">Es ist nichts im Verlauf</div>
        )}
      </div>
    </div>
  );
});

export default History;
