import React from "react";
import LogTitle from "../components/log/logTitle";
import LogList from "../components/log/logList";

const LogListContainer = () => {
  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      <LogTitle />
      <LogList />
    </div>
  );
};

export default LogListContainer;
