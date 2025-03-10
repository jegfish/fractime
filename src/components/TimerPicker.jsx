import Grid from "@mui/material/Grid2";
import { Button, Card, Box } from "@mui/material";

// Icon to pick a single timer.
function Picker({ children }) {
  return <Button variant="contained">{children}</Button>;
}

export default function TimerPicker({ db, categories }) {
  return (
    <Grid container>
      {categories.map((c) => (
        <Grid key={c.id} size={2}>
          <Picker>{c.text}</Picker>
        </Grid>
      ))}
    </Grid>
  );
}
