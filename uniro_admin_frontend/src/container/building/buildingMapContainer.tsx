import React, { forwardRef } from "react";
type BuildingMapContainerProps = {
  mode: "add" | "connect" | "view";
  setMode: React.Dispatch<React.SetStateAction<"add" | "connect" | "view">>;
  resetToAddMode: () => void;
};

const BuildingMapContainer = forwardRef<
  HTMLDivElement,
  BuildingMapContainerProps
>(({ mode, resetToAddMode }: BuildingMapContainerProps, ref) => {
  return (
    <div className="flex flex-col w-3/5 h-full pb-4 px-1">
      <div className="flex gap-2 p-4">
        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            mode === "view"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => alert("건물 목록이나, 건물을 직접 클릭해주세요!")}
        >
          건물 노드 수정
        </button>

        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            mode === "add"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => resetToAddMode()}
        >
          건물 노드 추가
        </button>

        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            mode === "connect"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => alert("아직 지원하지 않는 기능입니다.")}
        >
          건물 → 길 생성
        </button>
      </div>
      <div id="map" ref={ref} style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
});

export default BuildingMapContainer;
