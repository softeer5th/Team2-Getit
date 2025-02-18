import { useState } from "react";
import Map from "../component/Map";

interface MapContainerProps {
  rev: number;
}

const MapContainer = ({ rev }: MapContainerProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  return (
    <div className="flex flex-col w-4/5 h-full pb-4 px-1">
      <div className="flex flex-row items-center justify-between w-full h-[50px] px-2">
        <div className="text-kor-heading2">2025년 2월 3일 15:34 {rev}</div>
        <button className="rounded-100 bg-primary-500 py-2 px-4 text-system-skyblue hover:bg-primary-600">
          수정하기
        </button>
      </div>
      <Map setMap={setMap} />
    </div>
  );
};

export default MapContainer;
