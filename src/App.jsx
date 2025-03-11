import React, { useState } from "react";
import { Container, Button } from "@mui/material";

import "./App.css";

import Timer from "./components/Timer";
import TimerPicker from "./components/TimerPicker";
import DebugDB from "./components/DebugDB";

function App({ db }) {
  const [ctx, setCtx] = useState({
    frac: 1 / 3,
    accumBreak: 5,
  });
  // const [timer, setTimer] = useState({
  //   elapsed: 0,
  //   checkpoint: -1, // last time was set to running
  //   isActive: false, // have a timer that is paused or running
  //   isRunning: false, // timer is counting up
  // });
  const _cats = [
    { id: 1, text: "Fractime" },
    { id: 2, text: "Walk" },
    { id: 3, text: "Run" },
    { id: 4, text: "Fly" },
    { id: 5, text: "Ski" },
  ];
  const [categories, setCategories] = useState(_cats);

  return (
    <Container>
      <Timer ctx={ctx}></Timer>
      <TimerPicker categories={categories}></TimerPicker>
      <DebugDB></DebugDB>
    </Container>
  );
}

export default App;
