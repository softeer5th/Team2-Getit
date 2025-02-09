import React from "react";

type BuildingCardProps = {
  buildingName: string;
};

const BuildingCard = ({ buildingName }: BuildingCardProps) => {
  return (
    <div className="flex flex-col rounded-100 border-[1px] border-gray-300 shadow-2xs w-full py-1 px-2 text-kor-body2 text-left font-semibold">
      <div className="w-full flex justify-start">
        <h2 className="text-lg mb-4">{buildingName}</h2>
      </div>

      <div className="w-full flex flex-row justify-end gap-2">
        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600`}
          onClick={() => alert("아직 지원하지 않는 기능입니다.")}
        >
          수정하기
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-red-500 text-white hover:bg-red-600`}
          onClick={() => alert("아직 지원하지 않는 기능입니다.")}
        >
          삭제하기
        </button>
      </div>
    </div>
  );
};

export default BuildingCard;
