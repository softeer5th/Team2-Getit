import React, { useCallback, useEffect, useRef, useState } from "react";
import MainContainer from "../container/mainContainer";
import BuildingListContainer from "../container/building/buildingListContainer";
import BuildingMapContainer from "../container/building/buildingMapContainer";
import BuildingAddContainer from "../container/building/buildingAddContainer";
import useMap from "../hooks/useMap";
import { Coord } from "../data/types/coord";

import createMarkerElement from "../components/map/mapMarkers";
import { QueryClient, useQueries } from "@tanstack/react-query";
import { getAllRoutes } from "../api/route";
import { CoreRoute, CoreRoutesList } from "../data/types/route";
import { getAllBuildings } from "../api/nodes";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import { Node, NodeId } from "../data/types/node";
import { Markers } from "../constant/enum/markerEnum";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";
import useUniversity from "../hooks/useUniversity";

const BuildingPage = () => {
  const { university } = useUniversity();
  const queryClient = new QueryClient();
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

  // mode = add or view일 때 선택한 빌딩 좌표
  const [selectedCoord, setSelectedCoord] = useState<Coord | undefined>(
    undefined
  );

  // mode = connect일 때 선택한 좌표들
  const [selectedNode, setSelectedNode] = useState<Node[]>([]);
  // mode = connect일 때 연결한 하나의 좌표
  const [_, setSelectedSingleNode] = useState<Node | null>(null);

  // mode = connect일 때 선택한 Edge
  const [selectedEdge, setSelectedEdge] = useState<{
    info: CoreRoute;
    marker1: google.maps.marker.AdvancedMarkerElement;
    marker2: google.maps.marker.AdvancedMarkerElement;
    polyline: google.maps.Polyline;
  }>();

  /// mode = connect일 때 그려진 작은 하나의 Edge(선택한 Edge)
  const [singleRoute, setSingleRoute] = useState<{
    start: Coord;
    end: Coord;
    polyline: google.maps.Polyline;
  }>();

  // event의 mode가 참조가 안되어서 만든 State
  const [buildingMarkers, setBuildingMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  const [polylineList, setPolylineList] = useState<google.maps.Polyline[]>([]);

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

    setSelectedBuildingId(0);
    setMode("add");
    setSelectedCoord({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const drawRoute = (
    coreRouteList: CoreRoutesList,
    mode: "add" | "connect" | "view"
  ) => {
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
        if (mode === "view" || mode === "add") setSelectedBuildingId(0);
      });

      const subNodes = [subRoutes[0].node1, ...subRoutes.map((el) => el.node2)];

      const polyline = new Polyline({
        map: map,
        path: subNodes.map((el) => {
          return { lat: el.lat, lng: el.lng };
        }),
        strokeColor: "#808080",
      });

      //polyline을 선택 방지
      google.maps.event.addListener(
        polyline,
        "click",
        (e: { latLng: google.maps.LatLng }) => {
          if (mode === "view" || mode === "add") setSelectedBuildingId(0);
          if (mode === "connect") {
            const edges: CoreRoute[] = subRoutes.map(
              ({ routeId, node1, node2 }) => {
                return { routeId, node1, node2 };
              }
            );

            const { edge: nearestEdge } = findNearestSubEdge(edges, {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            });
            const { node1, node2 } = nearestEdge;

            const polyline = new Polyline({
              map: map,
              path: [
                { lat: node1.lat, lng: node1.lng },
                { lat: node2.lat, lng: node2.lng },
              ],
              strokeColor: "#000000",
              zIndex: 100,
            });

            const marker1 = new AdvancedMarker({
              map: map,
              position: { lat: node1.lat, lng: node1.lng },
              content: createMarkerElement({
                type: "waypoint_red",
                className: "translate-waypoint",
              }),
              zIndex: 100,
            });

            const marker2 = new AdvancedMarker({
              map: map,
              position: { lat: node2.lat, lng: node2.lng },
              content: createMarkerElement({
                type: "waypoint_blue",
                className: "translate-waypoint",
              }),
              zIndex: 100,
            });
            setSelectedEdge({
              info: nearestEdge,
              marker1,
              marker2,
              polyline,
            });

            setSelectedNode([node1, node2]);
          }
        }
      );
      setPolylineList((prev) => [...prev, polyline]);

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
        if (mode === "view" || mode === "add") setSelectedBuildingId(0);
      });
    }
  };

  const drawSingleRoute = (start: Coord, end: Coord) => {
    if (!Polyline || !AdvancedMarker || !map) return;

    if (singleRoute) {
      singleRoute.polyline.setMap(null);
    }

    if (selectedBuildingId === 0) {
      return;
    }

    const polyline = new Polyline({
      map: map,
      path: [start, end],
      strokeColor: "#808080",
    });

    setSingleRoute({ start, end, polyline });
  };

  const eraseRoute = () => {
    if (singleRoute) {
      singleRoute.polyline.setMap(null);
    }
  };

  const erasePolylineList = () => {
    for (const polyline of polylineList) {
      polyline.setMap(null);
    }
    setPolylineList([]);
  };

  const addBuildings = () => {
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
        map.setCenter({ lat, lng });
        map.setZoom(18);
        console.log("click", mode);
        if (mode === "view" || mode === "add") {
          setMode("view");
        }
      });

      setBuildingMarkers((prev) => [...prev, buildingMarker]);
    }
  };

  const clearBuildingMarkers = () => {
    for (const marker of buildingMarkers) {
      marker.map = null;
    }
    setBuildingMarkers([]);
  };

  // 지도가 로드되면 클릭 이벤트를 추가
  useEffect(() => {
    if (!map || !mapLoaded || !university) return;

    if (routes.data) {
      if (routes.data) {
        drawRoute(routes.data, mode);
      }
    }
    if (buildings.data) {
      addBuildings();
    }

    if (mode === "add") {
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
      map.addListener("click", handleMapClick);
      map.addListener("rightclick", () => {
        setSelectedCoord(undefined);
        setSelectedBuildingId(0);

        if (markerRef.current) markerRef.current.map = null;
      });
    }

    if (mode === "connect") {
      setSelectedCoord(undefined);
      setSelectedBuildingId(0);
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
    }

    map.setCenter(university.centerPoint);
    eraseRoute();

    return () => {
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
      clearBuildingMarkers();
    };
  }, [map, mapLoaded, routes.data, buildings.data]);

  useEffect(() => {
    if (!map || !mapLoaded) return;

    if (routes.data) {
      clearBuildingMarkers();
      erasePolylineList();
      drawRoute(routes.data, mode);
    }

    if (mode === "add") {
      addBuildings();
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
      map.addListener("click", handleMapClick);
      map.addListener("rightclick", () => {
        setSelectedCoord(undefined);
        setSelectedBuildingId(0);

        if (markerRef.current) markerRef.current.map = null;
      });
    }

    if (mode === "connect") {
      addBuildings();
      setSelectedCoord(undefined);
      setSelectedBuildingId(0);
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
    }
    return () => {
      google.maps.event.clearListeners(map, "click");
      google.maps.event.clearListeners(map, "rightclick");
    };
  }, [mode]);

  // 선택한 좌표가 바뀌면 마커를 생성하거나 제거
  useEffect(() => {
    if (!selectedCoord || !map) return;

    if (markerRef.current) markerRef.current.map = null;
    markerRef.current = createMarker(selectedCoord);

    return () => {
      if (markerRef.current) markerRef.current.map = null;
    };
  }, [selectedCoord, map, AdvancedMarker, createMarker]);

  const setCenterToCoordinate = (nodeId: number, coord: Coord) => {
    if (map) {
      map.setZoom(18);
      map.setCenter(coord);
      setSelectedBuildingId(nodeId);
      setMode("view");
    }
  };

  // 새로고침 기능
  const refreshBuildings = () => {
    queryClient.invalidateQueries({ queryKey: [1001, "buildings"] });
    buildings.refetch();
  };

  const changeToConnectMode = () => {
    if (!university) return;

    setMode("connect");
    setSelectedBuildingId(0);
    if (map) {
      map.setZoom(17);
      map.setCenter(university?.centerPoint);
    }
  };

  const resetConnectMode = () => {
    setSelectedBuildingId(0);
    setSelectedEdge(undefined);
    setSelectedNode([]);
    setSelectedSingleNode(null);
    eraseRoute();
  };

  const resetToAddMode = () => {
    if (!university) return;
    setMode("add");
    setSelectedBuildingId(0);
    setSelectedEdge(undefined);
    setSelectedNode([]);
    setSelectedSingleNode(null);
    if (map) {
      map.setZoom(17);
      map.setCenter(university?.centerPoint);
    }
  };

  useEffect(() => {
    return () => {
      if (!selectedEdge) return;
      const { marker1, marker2, polyline } = selectedEdge;
      marker1.map = null;
      marker2.map = null;
      polyline.setMap(null);
      if (singleRoute) {
        eraseRoute();
      }
    };
  }, [selectedEdge]);

  return (
    <MainContainer>
      <BuildingListContainer
        setCenterToCoordinate={setCenterToCoordinate}
        selectedBuildingId={selectedBuildingId}
        buildings={buildings.data!}
        refreshBuildings={refreshBuildings}
        refetching={buildings.isRefetching}
      />
      <BuildingMapContainer
        ref={mapRef}
        mode={mode}
        setMode={setMode}
        resetToAddMode={resetToAddMode}
        changeToConnectMode={changeToConnectMode}
      />
      <BuildingAddContainer
        selectedCoord={selectedCoord}
        setSelectedCoord={setSelectedCoord}
        markerRef={markerRef}
        selectedNode={selectedNode}
        drawSingleRoute={drawSingleRoute}
        resetConnectMode={resetConnectMode}
        mode={mode}
        selectedBuilding={
          buildings.data?.find(
            (building) => building.nodeId === selectedBuildingId
          ) || null
        }
      />
    </MainContainer>
  );
};

export default BuildingPage;
