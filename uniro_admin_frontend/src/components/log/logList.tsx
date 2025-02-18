import React, { Dispatch, SetStateAction } from "react";
import LogCard from "./logCard";
import { logCardData } from "../../data/mock/logMockData";
import { RevisionType } from "../../data/types/revision";

interface LogListProps {
  selected: RevisionType;
  setSelect: Dispatch<SetStateAction<RevisionType>>;
  revisions: RevisionType[];
}

const LogList = ({ selected, revisions, setSelect }: LogListProps) => {

  // const reversed = [...revisions].reverse();


  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-scroll px-1 space-y-2 mb-2 ">
      {revisions.map((revision) => {
        return <LogCard setSelect={setSelect} isSelected={selected.rev === revision.rev} version={revision} />;
      })}
    </div>
  );
};

export default LogList;
