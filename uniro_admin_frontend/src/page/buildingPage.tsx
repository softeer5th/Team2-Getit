import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../container/mainContainer";
import BuildingListContainer from "../container/building/buildingListContainer";
import BuildingMapContainer from "../container/building/buildingMapContainer";
import BuildingAddContainer from "../container/building/buildingAddContainer";
import useMap from "../hooks/useMap";
import { Coord } from "../data/types/coord";
import useSearchBuilding from "../hooks/useUniversityRecord";

const BuildingPage = () => {
  // 선택한 지점은 가장 높은 레벨의 컴포넌트에서 관리

  // mode는 두개로 분류 (건물 추가 / 수정 모드 , 건물과 주변 길 잇는 모드(출입문 연결)
  const [mode, setMode] = useState<"add" | "connect">("add");

  const { map, mapLoaded, mapRef, AdvancedMarker } = useMap();
  const { getCurrentUniversityLngLat } = useSearchBuilding();
  const [selectedCoord, setSelectedCoord] = useState<Coord | undefined>(
    undefined
  );

  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  const createMarker = useCallback(
    (coord: Coord) => {
      if (!map || !AdvancedMarker) return null;
      return new AdvancedMarker({ position: coord, map });
    },
    [map, AdvancedMarker]
  );

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setSelectedCoord({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  useEffect(() => {
    if (!map || !mapLoaded) return;

    map.setCenter(getCurrentUniversityLngLat());

    google.maps.event.clearListeners(map, "click");
    map.addListener("click", handleMapClick);

    return () => google.maps.event.clearListeners(map, "click");
  }, [map, mapLoaded, getCurrentUniversityLngLat]);

  useEffect(() => {
    if (!selectedCoord || !map) return;

    if (markerRef.current) markerRef.current.map = null;
    markerRef.current = createMarker(selectedCoord);

    return () => {
      if (markerRef.current) markerRef.current.map = null;
    };
  }, [selectedCoord, map, AdvancedMarker, createMarker]);

  return (
    <MainContainer>
      <BuildingListContainer />
      <BuildingMapContainer ref={mapRef} mode={mode} setMode={setMode} />
      <BuildingAddContainer selectedCoord={selectedCoord} />
    </MainContainer>
  );
};

export default BuildingPage;
