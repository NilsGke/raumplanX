import "../styles/calender.scss";
import { AiOutlineClose } from "react-icons/ai";
import { useState, forwardRef, useImperativeHandle } from "react";

const Calender = forwardRef((props, ref) => {
  // state if calender is open or not
  const [isOpen, setIsOpen] = useState(false);
  // state for data
  const [data, setData] = useState();

  useImperativeHandle(ref, () => ({
    setData(data) {
      setData(data);
    },
    closeCalender() {
      setIsOpen(false);
    },
    openCalender() {
      setIsOpen(true);
    },
    isOpen: isOpen,
  }));

  return (
    <>
      <div id="calenderBackground" className={isOpen ? "open" : ""}></div>
      <div id="calender" className={isOpen ? "visible" : ""}>
        <div id="calenderHeader">
          <h1 style={{ color: data?.color }}>{data?.title}</h1>
          <button id="calenderClose" onClick={() => setIsOpen(false)}>
            <AiOutlineClose />
          </button>
        </div>
        <iframe title="Calender" src={data?.link}></iframe>
      </div>
    </>
  );
});

Calender.displayName = "Calender";
export default Calender;
