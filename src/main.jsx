import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { addRxPlugin, createRxDatabase } from "rxdb/plugins/core";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { wrappedValidateZSchemaStorage } from "rxdb/plugins/validate-z-schema";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { Provider } from "rxdb-hooks";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import App from "./App.jsx";
import "./index.css";

addRxPlugin(RxDBDevModePlugin);

const initialize = async () => {
  const storage = wrappedValidateZSchemaStorage({
    storage: getRxStorageDexie(),
  });
  const db = await createRxDatabase({
    name: "fractimedb",
    storage,
    multiInstance: true, // in case user opens in multiple tabs
    eventReduce: true,
  });

  const contextSchema = {
    version: 0,
    primaryKey: "id",
    type: "object",
    properties: {
      id: {
        type: "string",
        maxLength: 100,
      },
      data: {
        type: "object",
      },
    },
  };
  const tagSchema = {
    version: 0,
    primaryKey: "name",
    type: "object",
    properties: {
      name: {
        type: "string",
        maxLength: 30,
      },
      state: {
        type: "string",
        // "on" | "off" | "sticky"
        maxLength: 6,
      },
      isArchived: {
        type: "boolean",
      },
    },
  };
  const timersSchema = {
    version: 0,
    title: "timers schema",
    primaryKey: "created",
    type: "object",
    properties: {
      created: {
        type: "string",
        format: "date-time",
        // max length: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
        maxLength: 27,
      },
      elapsed: {
        type: "number",
      },
      tags: {
        type: "array",
        uniqueItems: true,
        items: {
          type: "string",
        },
      },
    },
  };
  const activeTimersSchema = {
    version: 0,
    title: "active timers schema",
    primaryKey: "created",
    type: "object",
    properties: {
      created: {
        type: "string",
        format: "date-time",
        maxLength: 27,
      },
      elapsed: {
        type: "number",
      },
      isRunning: {
        type: "boolean",
      },
      // TODO: Is checkpoint still necessary now that we removed the ability to pause timers?
      // Currently `created` is set ahead of time. So checkpoint is maybe not quite ready to be primary key.
      // Even if it is not doing much, it is valuable to be separate from `created` so can handle potential conflicts of ending up with multiple active timers.
      checkpoint: {
        type: "string",
        format: "date-time",
        maxLength: 27,
      },
      // Whether checkpoint is real or is a placeholder/null value.
      isActive: {
        type: "boolean",
      },
    },
  };

  try {
    await db.addCollections({
      // context: {
      //   schema: contextSchema,
      // },
      activeTimers: {
        schema: activeTimersSchema,
      },
      timers: {
        schema: timersSchema,
      },
      tags: {
        schema: tagSchema,
      },
    });

    // await db.activeTimers.remove();
  } catch (err) {
    // TODO: Remove. Is only for ease of changing DB schema during development.
    // await db.remove();
  }

  return db;
};

// https://github.com/cvara/rxdb-hooks
const Root = () => {
  const [db, setDb] = useState();

  useEffect(() => {
    initialize().then(setDb);
  });

  return (
    <Provider db={db}>
      <App />
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

// For Electron
// Use contextBridge
// window.ipcRenderer.on("main-process-message", (_event, message) => {
//   console.log(message);
// });
