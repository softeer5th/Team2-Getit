import React from "react";

type BuildingListTitleProps = {
  refreshBuildings: () => void;
  refetching: boolean;
};

const BuildingListTitle = ({
  refreshBuildings,
  refetching,
}: BuildingListTitleProps) => {
  return (
    <div className="pl-1 text-kor-heading2 py-1 border-b-2 border-gray-200 w-full text-left font-semibold mb-2 flex justify-between items-center">
      <div className="ml-1">건물 목록</div>
      <button
        onClick={() => refreshBuildings()}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600 mr-2`}
      >
        {refetching ? "새로고침 중.." : "새로고침"}
      </button>
    </div>
  );
};

export default BuildingListTitle;
