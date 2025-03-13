// Component for user to pick tags for a timer.

import React, { useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  Button,
  Card,
  Box,
  List,
  ListItem,
  IconButton,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRxData, useRxCollection } from "rxdb-hooks";

const tagIsOn = (tag) => tag.state === "on" || tag.state === "sticky";

// Icon to pick a single timer.
function Picker({ children }) {
  return <Button variant="contained">{children}</Button>;
}

export default function TimerPicker({ db, categories }) {
  const { result: tags, isFetching } = useRxData("tags", (collection) =>
    collection.find({
      selector: {
        isArchived: false,
      },
    }),
  );

  if (isFetching) {
    return <p>loading...</p>;
  }

  const handleTagButton = (tag) => (event) => {
    if (tag.state === "sticky") {
      return;
    }

    tag.patch({
      state: tag.state === "on" ? "off" : "on",
    });
  };

  const handleStickyToggle = (tag) => (event) => {
    event.preventDefault();

    tag.patch({
      state: tag.state === "sticky" ? "off" : "sticky",
    });
  };

  return (
    <>
      <List sx={{ width: "100%", maxWidth: 360 }}>
        {tags.map((tag, idx) => (
          <ListItem
            key={tag.name}
            disablePadding
            secondaryAction={
              <Checkbox
                edge="end"
                checked={tag.state === "sticky"}
                onChange={handleStickyToggle(tag)}
              />
            }
          >
            <ListItemButton
              onClick={handleTagButton(tag)}
              role={undefined}
              dense
              selected={tagIsOn(tag)}
            >
              <ListItemText primary={tag.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}
