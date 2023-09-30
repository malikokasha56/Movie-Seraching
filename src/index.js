import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
// import StarRating from "./StarRating";
import App from "./App-v2";

function Test() {
  const [movieRating, setMovierating] = useState(0);
  return (
    <div>
      {/* <StarRating defaultRating={3} onSetRating={setMovierating} /> */}
      <p>This movie has {movieRating} rating </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <App /> */}
    {/* <StarRating maxStar={10} /> */}
    {/* <StarRating
      maxStar={5}
      color="red"
      size="24"
      messages={["Worst", "bad", "Okay", "Good", "Amazing"]}
    /> */}
    {/* <Test /> */}
  </React.StrictMode>
);
