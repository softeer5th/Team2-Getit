import React from "react";
import LogCard from "./logCard";

const logCardData = [
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
  {
    date: "2025-10-20",
    change: "변경 추가",
  },
];

const LogList = () => {
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-scroll px-1 space-y-2 mb-2 ">
      {logCardData.map((log) => {
        return <LogCard date={log.date} change={log.change} />;
      })}
    </div>
  );
};

export default LogList;
