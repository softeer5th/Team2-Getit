import React from "react";
import { Coord } from "../../data/types/coord";

type BuildingAddContainerProps = {
  selectedCoord: Coord | undefined;
};

const BuildingAddContainer = ({ selectedCoord }: BuildingAddContainerProps) => {
  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      {selectedCoord ? (
        <>
          <div className="text-kor-body1 flex flex-col items-center gap-2 items-start bg-gray-100 p-2 w-full ">
            <p className="font-semibold text-gray-700">선택한 위치:</p>
            <p className="text-blue-500">lat: {selectedCoord.lat}</p>
            <p className="text-green-500">lng: {selectedCoord.lng}</p>
          </div>
          <form className="flex-1 flex flex-col items-start w-full h-full p-4">
            <h2 className="text-kor-heading1 pb-2 border-b-2 w-full mb-2 border-gray-300 text-left font-semibold">
              건물 추가하기
            </h2>
            <div className="text-kor-body1">건물명</div>
            <input
              type="text"
              className="w-full h-10 border-2 border-gray-300 rounded-md p-2"
            />
            <div className="text-kor-body1">건물 사진</div>
            <input
              type="file"
              className="w-full h-10 border-2 border-gray-300 rounded-md p-2 cursor-pointer"
            />

            <div className="text-kor-body1">전화번호</div>
            <input
              type="tel"
              className="w-full h-10 border-2 border-gray-300 rounded-md p-2"
            />
            <div className="text-kor-body1">주소</div>
            <input
              type="text"
              className="w-full h-10 border-2 border-gray-300 rounded-md p-2"
            />
          </form>
          <div className="flex justify-end w-full p-4">
            <button
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600`}
              onClick={() => alert("아직 지원하지 않는 기능입니다.")}
            >
              추가하기
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center w-full h-full">
          <div className="text-kor-heading2">지도에서 위치를 선택해주세요</div>
        </div>
      )}
    </div>
  );
};

export default BuildingAddContainer;
