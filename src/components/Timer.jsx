// Display:
// - current timer state. Timer and category/tag(s)
// - built up break time.
//   - Granularity of a minute. So won't be distractingly ticking up. Only ticking up every 3 minutes.

import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useRxCollection, useRxDB, useRxData } from "rxdb-hooks";

import { tagIsOn } from "../utils";

let stopwatchDisplay, setStopwatchDisplay;

function useActiveTimer() {
  const [timer, setTimer] = useState(null);

  const activeTimers = useRxCollection("activeTimers");

  useEffect(() => {
    if (!activeTimers) {
      return;
    }

    const query = activeTimers.find();
    const querySub = query.$.subscribe((results) => {
      if (results.length > 0) {
        setTimer(results[0]._data);
      } else {
        console.log("no active timer, making one");
        // no active timer
        activeTimers.insert({
          created: new Date().toISOString(),
          elapsed: 0,
          checkpoint: new Date("2000-01-01").toISOString(),
          isActive: false,
          isRunning: false,
        });
      }
    });

    return () => {
      querySub.unsubscribe();
    };
  }, [activeTimers]);

  const setActiveTimer = (newTimer) => {
    if (!activeTimers) {
      return;
    }

    activeTimers.incrementalUpsert({
      ...newTimer,
    });
  };

  return [timer, setActiveTimer];
}

// Elapsed time in seconds.
function timerLength(timer) {
  // Stored `timer.elapsed` is a checkpoint. True elapsed for a running timer requires adding the difference between current time and the checkpoint timestamp.
  return Math.floor(
    timer.elapsed + (new Date() - new Date(timer.checkpoint)) / 1000,
  );
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
  // const accumBreak = ctx.accumBreak + timerLength(timer) / ctx.fracDenominator;
  const accumBreak = 0;

  return (
    <>
      <p>
        Break: {accumBreak} (fraction: 1/{ctx.fracDenominator})
      </p>
    </>
  );
}

const tickStopwatch = (timer) => () => {
  // console.log(timer);
  if (timer.isRunning) {
    setStopwatchDisplay(timerLength(timer));
    setTimeout(tickStopwatch(timer), 10);
  }
};

function Timer({ ctx }) {
  [stopwatchDisplay, setStopwatchDisplay] = useState(0);
  const db = useRxDB();
  const [timer, setActiveTimer] = useActiveTimer();

  // https://www.geeksforgeeks.org/create-a-stop-watch-using-reactjs/
  // Run stopwatch.
  React.useEffect(() => {
    let interval;

    if (!timer) {
      return;
    }

    if (timer.isActive) {
      interval = setInterval(() => {
        if (timer.isRunning) {
          setStopwatchDisplay(timerLength(timer));
        } else {
          // timerLength() takes time since last checkpoint into account.
          // But if timer is paused, only show recorded elapsed time.
          setStopwatchDisplay(timer.elapsed);
        }
      });
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const { result: enabledTags, isFetching: isFetchingEnabledTags } = useRxData(
    "tags",
    (collection) =>
      collection.find({
        selector: {
          $or: [{ state: { $eq: "on" } }, { state: { $eq: "sticky" } }],
        },
      }),
  );

  if (!db || !timer || isFetchingEnabledTags) {
    return <p>loading...</p>;
  }

  let runButton;
  if (timer.isRunning) {
    runButton = "Stop";
  } else {
    runButton = "Start";
  }

  const handleRunButton = (event) => {
    let newTimer;
    switch (runButton) {
      case "Start":
        const now = new Date().toISOString();
        newTimer = {
          ...timer,
          isActive: true,
          isRunning: true,
          checkpoint: now,
        };
        break;
      case "Stop":
        // TODO: On stop, remove from active timers and move to `timers` collection.
        newTimer = {
          ...timer,
          isRunning: false,
          elapsed: 0,
        };
        // Record completed timer.
        db.timers.insert({
          created: timer.checkpoint,
          elapsed: timerLength(timer),
          tags: enabledTags.map((tag) => tag.name),
        });
        // Turn off all non-sticky tags.
        const query = db.tags.find({
          selector: {
            state: {
              $eq: "on",
            },
          },
        });
        query.incrementalPatch({
          state: "off",
        });
        break;
      default:
        console.error(`runButton was unexpectedly ${runButton}`);
    }
    setActiveTimer(newTimer);
  };

  const handleStopButton = (event) => {
    setStopwatchDisplay(0);
    setActiveTimer({
      ...timer,
      isActive: false,
      isRunning: false,
      elapsed: 0,
    });
  };

  return (
    <>
      <Stopwatch ctx={ctx} timer={timer}></Stopwatch>
      <BreakTime ctx={ctx} timer={timer}></BreakTime>
      <Button variant="contained" onClick={handleRunButton}>
        {runButton}
      </Button>
    </>
  );
}

export default Timer;
