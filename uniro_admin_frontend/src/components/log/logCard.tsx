import React from "react";

type LogCardProps = {
  date: string;
  change: string;
};

export const LogCard = ({ date, change }: LogCardProps) => {
  return (
    <div className="flex flex-col rounded-100 border-[1px] border-gray-300 shadow-2xs items-center justify-center w-full py-1 px-2 text-kor-body2 text-left font-semibold hover:bg-gray-700 hover:text-white transition-colors">
      <h2 className="w-full text-left text-sm mb-4">{date}</h2>
      <p className="w-full text-right">{change}</p>
    </div>
  );
};

export default LogCard;
