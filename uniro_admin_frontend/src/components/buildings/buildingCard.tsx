import React from "react";

type BuildingCardProps = {
  buildingName: string;
  nodeId: number;
  isSelected: boolean;
  onDelete?: () => void;
  onClick: () => void;
};

const BuildingCard = ({
  buildingName,
  nodeId,
  isSelected = false,
  onDelete,
  onClick,
}: BuildingCardProps) => {
  return (
    <div
      className={`flex flex-col rounded-100 shadow-2xs w-full py-1 px-2 text-kor-body2 text-left font-semibold ${isSelected ? "border-blue-600 border-2" : "border-[1px] border-gray-300"}`}
      onClick={() => onClick()}
    >
      <div className="w-full flex justify-between">
        <h2 className="text-lg mb-4">건물명 : {buildingName}</h2>
        <h2 className="text-lg mb-4">node ID : {nodeId}</h2>
      </div>

      <div className="w-full flex flex-row justify-end gap-2">
        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-red-500 text-white hover:bg-red-600`}
          onClick={
            onDelete ? onDelete : () => alert("아직 지원하지 않는 기능입니다.")
          }
        >
          삭제하기
        </button>
      </div>
    </div>
  );
};

export default BuildingCard;
