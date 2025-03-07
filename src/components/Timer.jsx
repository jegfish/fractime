// Display:
// - current timer state. Timer and category/tag(s)
// - built up break time.
//   - Granularity of a minute. So won't be distractingly ticking up. Only ticking up every 3 minutes.

import React, { useState } from "react";
import { Button } from "@mui/material";

let stopwatchDisplay, setStopwatchDisplay;

// Elapsed time in seconds.
function timerLength(timer) {
  return Math.floor(timer.elapsed + (Date.now() - timer.checkpoint) / 1000);
}

// https://stackoverflow.com/a/2998822
function padNum(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function secsToHMS(st) {
  let s = st;
  const hours = Math.floor(s / 3600);
  s %= 3600;
  const minutes = Math.floor(s / 60);
  s %= 60;
  const seconds = Math.floor(s % 60);

  return [hours, minutes, seconds];
}

function Stopwatch({ ctx, timer }) {
  const [hours, minutes, seconds] = secsToHMS(stopwatchDisplay);
  const display = `${padNum(hours, 2)}:${padNum(minutes, 2)}:${padNum(seconds, 2)}`;

  return (
    <>
      <p>{display}</p>
    </>
  );
}

function BreakTime({ ctx, timer }) {
  // const accumBreak = ctx.accumBreak + timerLength(timer) * ctx.frac;
  const accumBreak = 0;

  return (
    <>
      <p>Break: {accumBreak}</p>
    </>
  );
}

const tickStopwatch = (timer) => () => {
  console.log(timer);
  if (timer.isRunning) {
    setStopwatchDisplay((Date.now() - timer.checkpoint) / 1000);
    setTimeout(tickStopwatch(timer), 10);
  }
};

function Timer({ ctx, timer, setTimer }) {
  [stopwatchDisplay, setStopwatchDisplay] = useState(0);

  let runButton;
  if (timer.isRunning && timer.isActive) {
    runButton = "Pause";
  } else if (!timer.isRunning && timer.isActive) {
    runButton = "Resume";
  } else {
    runButton = "Start";
  }

  // https://www.geeksforgeeks.org/create-a-stop-watch-using-reactjs/
  // Run stopwatch.
  React.useEffect(() => {
    let interval;

    if (timer.isActive && timer.isRunning) {
      interval = setInterval(() => {
        setStopwatchDisplay(timerLength(timer));
      });
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const handleRunButton = (event) => {
    let newTimer;
    switch (runButton) {
      case "Start":
        newTimer = {
          ...timer,
          isActive: true,
          isRunning: true,
          checkpoint: Date.now(),
        };
        break;
      case "Pause":
        newTimer = {
          ...timer,
          isRunning: false,
          elapsed: timer.elapsed + (Date.now() - timer.checkpoint) / 1000,
        };
        break;
      case "Resume":
        newTimer = {
          ...timer,
          isRunning: true,
          checkpoint: Date.now(),
        };
        break;
      default:
        console.error(`runButton was unexpectedly ${runButton}`);
    }
    setTimer(newTimer);
  };

  const handleStopButton = (event) => {
    // TODO: Log elapsed time to database.
    // Though maybe more is "stop/delete the timer".
    // Maybe is timer state is directly connected to the database already for syncing running timer, and then we track ID of the current timer, and then Stop button will set current timer to None.
    setTimer({ ...timer, isActive: false, isRunning: false, elapsed: 0 });
    setStopwatchDisplay(0);
  };

  return (
    <>
      <Stopwatch ctx={ctx} timer={timer}></Stopwatch>
      <BreakTime ctx={ctx} timer={timer}></BreakTime>
      <Button variant="outlined" onClick={handleRunButton}>
        {runButton}
      </Button>
      <Button variant="outlined" onClick={handleStopButton}>
        Stop
      </Button>
    </>
  );
}

export default Timer;
