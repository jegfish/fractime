import React, { useState } from "react";
import { useRxData, useRxCollection } from "rxdb-hooks";
import { Button, Box, TextField } from "@mui/material";

export default function DebugDB() {
  const [newTagName, setNewTagName] = useState("");

  const tagsColl = useRxCollection("tags");
  const { result: at, isFetching: atIsFetching } = useRxData(
    "activeTimers",
    (collection) => collection.find(),
  );
  const { result: tim, isFetching: timIsFetching } = useRxData(
    "timers",
    (collection) => collection.find(),
  );
  const { result: tags, isFetching: tagsIsFetching } = useRxData(
    "tags",
    (collection) => collection.find(),
  );

  if (!tagsColl || atIsFetching || timIsFetching || tagsIsFetching) {
    return <p>loading database view...</p>;
  }

  const handleNewTag = (event) => {
    event.preventDefault();

    tagsColl.insertIfNotExists({
      name: newTagName,
      state: "off",
      isArchived: false,
    });

    setNewTagName("");
  };

  return (
    <>
      <h2>DebugDB</h2>
      <Box component="form">
        <TextField
          size="small"
          label="Create new tag"
          value={newTagName}
          variant="outlined"
          onChange={(event) => {
            setNewTagName(event.target.value);
          }}
        ></TextField>
        <Button type="submit" variant="outlined" onClick={handleNewTag}>
          Add Tag
        </Button>
      </Box>
      <h3>activeTimers</h3>
      <ul>
        {at.map((t, idx) => (
          <li key={idx}>{JSON.stringify(t)}</li>
        ))}
      </ul>
      {/* <h3>tags</h3>
      <ul>
        {tags.map((t, idx) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul> */}
      <h3>timers</h3>
      <ul>
        {tim.map((t, idx) => (
          <li key={idx}>{t.elapsed}</li>
        ))}
      </ul>
    </>
  );
}
