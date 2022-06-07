import "../styles/teamlocations.scss";

export default function Teamlocation(props) {
  return (
    <div
      className="teamlocation"
      style={{
        top: props.data.y,
        left: props.data.x,
        color: props.data.color,
      }}
      onClick={() => props.openSearch(props.data.name)}
    >
      {props.data.name}
    </div>
  );
}

// TODO: onlick opens search with only that team
