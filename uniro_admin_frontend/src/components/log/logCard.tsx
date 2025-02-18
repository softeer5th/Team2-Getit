import React, { Dispatch, SetStateAction } from "react";
import { RevisionType } from "../../data/types/revision";

interface LogCardProps extends RevisionType {
  isSelected: boolean;
  setSelect: Dispatch<SetStateAction<number>>;
}
export const LogCard = ({ isSelected, setSelect, rev, revTime, action }: LogCardProps) => {

  return (
    <div onClick={() => setSelect(rev)} className={`flex flex-col rounded-100 border-[1px] border-gray-300 shadow-2xs items-center justify-center w-full py-1 px-2 text-kor-body2 text-left  hover:bg-gray-700 hover:text-white transition-colors ${isSelected && "bg-gray-700 text-white"}`}>
      <h2 className="w-full font-bold">Version ID : {rev}</h2>
      <p className="w-full text-sm">UPDATED AT : {revTime.slice(0, 10)} / {revTime.slice(11, -1)}</p>
      <p className="w-full text-sm">TYPE : {action}</p>
    </div >
  );
};

export default LogCard;
