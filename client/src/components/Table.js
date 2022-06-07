import React from "react";
import "../styles/table.scss";

export default function Table(props) {
  return (
    <div
      className={"table " + (props.highlighted ? " highlighted " : "")}
      onClick={(e) => {
        if (e.nativeEvent.pointerType === "touch") return; // dont open popup if touched on mobile (thats what the edit button is for)
        props.openPopup();
      }}
      style={{
        height: props.locationData.tableHeight + "px",
        width: props.locationData.tableWidth + "px",
        fontSize: props.locationData.fontSize,
        top: props.moving ? props.data.y + props.newPosition.y : props.data.y,
        left: props.moving ? props.data.x + props.newPosition.x : props.data.x,
        transform: props.moving
          ? `rotate(${props.newPosition.r}deg)`
          : `rotate(${props.data.r}deg)`,
      }}
      onMouseEnter={() => {
        props.setTooltipVisible(true);
        props.changeTooltipTable(props.data.id);
      }}
      onMouseLeave={() => {
        props.setTooltipVisible(false);
      }}
    >
      {props.data.tableNumber.substr(-3, 3)}
    </div>
  );
}
