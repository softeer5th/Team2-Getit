import React, { Dispatch, SetStateAction } from "react";
import LogTitle from "../components/log/logTitle";
import LogList from "../components/log/logList";
import { RevisionType } from "../data/types/revision";

interface LogListContainerProps {
  selected: number;
  revisions: RevisionType[];
  setSelect: Dispatch<SetStateAction<number>>;
}

const LogListContainer = ({ setSelect, selected, revisions }: LogListContainerProps) => {
  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      <LogTitle />
      <LogList setSelect={setSelect} selected={selected} revisions={revisions} />
    </div>
  );
};

export default LogListContainer;
