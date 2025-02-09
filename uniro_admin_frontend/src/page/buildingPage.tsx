import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../container/mainContainer";
import BuildingListContainer from "../container/building/buildingListContainer";
import BuildingMapContainer from "../container/building/buildingMapContainer";
import BuildingAddContainer from "../container/building/buildingAddContainer";
import useMap from "../hooks/useMap";
import { Coord } from "../data/types/coord";
import useSearchBuilding from "../hooks/useUniversityRecord";

import createMarkerElement from "../components/map/mapMarkers";
import { useQueries } from "@tanstack/react-query";
import { getAllRoutes } from "../api/route";
import { CoreRoutesList } from "../data/types/route";
import { getAllBuildings } from "../api/nodes";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import { NodeId } from "../data/types/node";
import { Markers } from "../constant/enum/markerEnum";

const BuildingPage = () => {
  const result = useQueries({
    queries: [
      { queryKey: ["1001", "routes"], queryFn: () => getAllRoutes(1001) },
      {
        queryKey: [1001, "buildings"],
        queryFn: () =>
          getAllBuildings(1001, {
            leftUpLat: 38,
            leftUpLng: 127,
            rightDownLat: 37,
            rightDownLng: 128,
          }),
      },
    ],
  });
  // 선택한 지점은 가장 높은 레벨의 컴포넌트에서 관리
  const [routes, buildings] = result;

  // mode는 두개로 분류 (건물 추가 / 수정 모드 , 건물과 주변 길 잇는 모드(출입문 연결)
  const [mode, setMode] = useState<"add" | "connect" | "view">("add");

  const { map, mapLoaded, mapRef, AdvancedMarker, Polyline } = useMap();
  const [selectedBuildingId, setSelectedBuildingId] = useState<NodeId | null>(
    0
  );
  const { getCurrentUniversityLngLat } = useSearchBuilding();
  const [selectedCoord, setSelectedCoord] = useState<Coord | undefined>(
    undefined
  );

  // 새로 선택한 건물 마커를 관리하기 위한 ref
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  // 마커 생성
  const createMarker = useCallback(
    (coord: Coord) => {
      if (!map || !AdvancedMarker) return null;
      return new AdvancedMarker({ position: coord, map });
    },
    [map, AdvancedMarker]
  );

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    if (selectedBuildingId !== 0) {
      setSelectedBuildingId(0);
    }
    setSelectedCoord({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const drawRoute = useCallback(
    (coreRouteList: CoreRoutesList) => {
      if (!Polyline || !AdvancedMarker || !map) return;

      for (const coreRoutes of coreRouteList) {
        const { routes: subRoutes } = coreRoutes;

        // 가장 끝쪽 Core Node 그리기
        const endNode = subRoutes[subRoutes.length - 1].node2;

        const endMarker = new AdvancedMarker({
          map: map,
          position: endNode,
          content: createMarkerElement({
            type: "waypoint",
            className: "translate-waypoint",
          }),
        });

        endMarker.addListener("click", () => {
          setSelectedBuildingId(0);
          return;
        });

        const subNodes = [
          subRoutes[0].node1,
          ...subRoutes.map((el) => el.node2),
        ];

        const polyline = new Polyline({
          map: map,
          path: subNodes.map((el) => {
            return { lat: el.lat, lng: el.lng };
          }),
          strokeColor: "#808080",
        });

        //polyline을 선택 방지
        google.maps.event.addListener(polyline, "click", () => {
          setSelectedBuildingId(0);
          return;
        });

        const startNode = subRoutes[0].node1;

        const startMarker = new AdvancedMarker({
          map: map,
          position: startNode,
          content: createMarkerElement({
            type: "waypoint",
            className: "translate-waypoint",
          }),
        });

        startMarker.addListener("click", () => {
          setSelectedBuildingId(0);
          return;
        });
      }
    },
    [Polyline, AdvancedMarker, map]
  );

  const addBuildings = useCallback(() => {
    if (google.maps.marker.AdvancedMarkerElement === null || map === null)
      return;

    const buildingList = buildings.data;

    if (buildingList === undefined) return;
    console.log(buildingList);
    for (const building of buildingList) {
      const { nodeId, lat, lng } = building;

      const buildingMarker = createAdvancedMarker(
        google.maps.marker.AdvancedMarkerElement,
        map,
        new google.maps.LatLng(lat, lng),
        createMarkerElement({
          type: Markers.BUILDING,
          className: "translate-marker",
        })
      );

      buildingMarker.addListener("click", () => {
        setSelectedBuildingId(nodeId);
        setMode("view");
      });
    }
  }, [buildings, map]);

  // 지도가 로드되면 클릭 이벤트를 추가
  useEffect(() => {
    if (!map || !mapLoaded) return;

    map.setCenter(getCurrentUniversityLngLat());

    if (mode === "add") {
      google.maps.event.clearListeners(map, "click");
      map.addListener("click", handleMapClick);
      map.addListener("rightclick", () => {
        setSelectedCoord(undefined);
        setSelectedBuildingId(0);
        if (markerRef.current) markerRef.current.map = null;
      });
    }
    if (routes.data) {
      drawRoute(routes.data);
    }
    if (buildings.data) {
      addBuildings();
    }

    return () => {
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
    };
  }, [map, mapLoaded, getCurrentUniversityLngLat, routes.data, buildings.data]);

  // 선택한 좌표가 바뀌면 마커를 생성하거나 제거
  useEffect(() => {
    if (!selectedCoord || !map) return;

    if (markerRef.current) markerRef.current.map = null;
    markerRef.current = createMarker(selectedCoord);

    return () => {
      if (markerRef.current) markerRef.current.map = null;
    };
  }, [selectedCoord, map, AdvancedMarker, createMarker]);

  useEffect(() => {}, [routes]);

  return (
    <MainContainer>
      <BuildingListContainer
        selectedBuildingId={selectedBuildingId}
        buildings={buildings.data!}
      />
      <BuildingMapContainer ref={mapRef} mode={mode} setMode={setMode} />
      <BuildingAddContainer
        selectedCoord={selectedCoord}
        setSelectedCoord={setSelectedCoord}
        markerRef={markerRef}
      />
    </MainContainer>
  );
};

export default BuildingPage;
