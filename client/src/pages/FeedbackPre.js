import "../styles/feedbackPre.scss";
import { Link } from "react-router-dom";

import { useEffect } from "react";
import github from "../img/github.svg";
import otherFeedback from "../img/otherFeedback.svg";

export default function FeedbackPre() {
  useEffect(() => {
    document.title = "Raumplan Feedback";
  }, []);

  return (
    <div id="feedbackPre">
      <div id="feedbackPreContainer">
        <a
          href="https://github.com/NilsGke/raumplan2"
          target="_blank"
          rel="noreferrer"
        >
          <div id="bug">
            <h1>Github</h1>
            <h2>Bugs, Feature requests, Ideen...</h2>
            <img src={github} alt="" />
          </div>
        </a>
        <a
          href={process.env.REACT_APP_FEEDBACK_EMAIL}
          target="_blank"
          rel="noreferrer"
        >
          <div id="Anderes">
            <h1>Email</h1>
            <h2>alles Andere</h2>
            <img src={otherFeedback} alt="" />
          </div>
        </a>
      </div>
      <div id="goBack">
        <Link to={{ pathname: "/" }}>
          <h1>zurück</h1>
        </Link>
      </div>
    </div>
  );
}
