import React, { forwardRef } from "react";
type BuildingMapContainerProps = {
  mode: "add" | "connect" | "view";
  setMode: React.Dispatch<React.SetStateAction<"add" | "connect" | "view">>;
};

const BuildingMapContainer = forwardRef<
  HTMLDivElement,
  BuildingMapContainerProps
>(({ mode, setMode }: BuildingMapContainerProps, ref) => {
  return (
    <div className="flex flex-col w-3/5 h-full pb-4 px-1">
      <div className="flex gap-2 p-4">
        <button
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            mode === "add"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => setMode("add")}
        >
          건물 노드 추가
        </button>

        {/* 건물 -> 길 생성 버튼 */}
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
