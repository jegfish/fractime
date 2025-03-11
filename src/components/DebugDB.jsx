import { useRxData } from "rxdb-hooks";

export default function DebugDB() {
  const { result: at, isFetching: atIsFetching } = useRxData(
    "activeTimers",
    (collection) => collection.find(),
  );
  const { result: tim, isFetching: timIsFetching } = useRxData(
    "timers",
    (collection) => collection.find(),
  );

  if (atIsFetching || timIsFetching) {
    return <p>loading database view...</p>;
  }

  return (
    <>
      <h2>DebugDB</h2>
      <h3>activeTimers</h3>
      <ul>
        {at.map((t, idx) => (
          <li key={idx}>{JSON.stringify(t)}</li>
        ))}
      </ul>
      <h3>timers</h3>
      <ul>
        {tim.map((t, idx) => (
          <li key={idx}>{t.elapsed}</li>
        ))}
      </ul>
    </>
  );
}
