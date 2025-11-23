import React, { useState } from "react";
import { Container, Button } from "@mui/material";

import "./App.css";

import Timer from "./components/Timer";
import TimerPicker from "./components/TimerPicker";
import DebugDB from "./components/DebugDB";

function App({ db }) {
  const [ctx, setCtx] = useState({
    fracDenominator: 3,
    accumBreak: 0,
  });
  // const [timer, setTimer] = useState({
  //   elapsed: 0,
  //   checkpoint: -1, // last time was set to running
  //   isActive: false, // have a timer that is paused or running
  //   isRunning: false, // timer is counting up
  // });
  const _cats = [
    { id: 1, text: "fractime" },
    { id: 2, text: "walk" },
    { id: 3, text: "run" },
    { id: 4, text: "fly" },
    { id: 5, text: "ski" },
  ];
  const [categories, setCategories] = useState(_cats);

  return (
    <Container>
      <Timer ctx={ctx}></Timer>
      <br />
      <TimerPicker categories={categories}></TimerPicker>
      <DebugDB></DebugDB>
    </Container>
  );
}

export default App;
