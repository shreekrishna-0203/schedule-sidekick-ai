
import React from "react";

const getFormattedTime = () => {
  const now = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  } as const;
  return now.toLocaleTimeString(undefined, options);
};

const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

const Time: React.FC = () => {
  const [now, setNow] = React.useState<Date>(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="font-mono text-sm text-primary">
      <div>Local Date: {getFormattedDate()}</div>
      <div>Local Time: {getFormattedTime()}</div>
    </div>
  );
};

export default Time;
