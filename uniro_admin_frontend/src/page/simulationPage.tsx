import React, { useEffect, useState } from "react";
import MainContainer from "../container/mainContainer";
import { useQueries } from "@tanstack/react-query";
import { transformAllRoutes } from "../utils/route";
import useMap from "../hooks/useMap";
import useSearchBuilding from "../hooks/useUniversityRecord";
import { CoreRoute, CoreRoutesList } from "../data/types/route";
import createMarkerElement from "../components/map/mapMarkers";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";

type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;
type Polyline = google.maps.Polyline;

const getRoutes = () => {
  return fetch(`${import.meta.env.VITE_REACT_SERVER_BASE_URL}/1001/routes`)
    .then((res) => res.json())
    .then(transformAllRoutes);
};

const SimulationPage = () => {
  const result = useQueries({
    queries: [{ queryKey: ["1001", "routes"], queryFn: getRoutes }],
  });
  const { currentUniversity, getCurrentUniversityLngLat } = useSearchBuilding();

  const { mapRef, map, mapLoaded, AdvancedMarker, Polyline } = useMap();
  const [routes] = result;
  const [selectedEdge, setSelectedEdge] = useState<{
    info: CoreRoute;
    marker1: AdvancedMarker;
    marker2: AdvancedMarker;
    polyline: Polyline;
  }>();

  const drawRoute = (coreRouteList: CoreRoutesList) => {
    if (!Polyline || !AdvancedMarker || !map) return;

    for (const coreRoutes of coreRouteList) {
      const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

      // 가장 끝쪽 Core Node 그리기
      const endNode = subRoutes[subRoutes.length - 1].node2;

      new AdvancedMarker({
        map: map,
        position: endNode,
        content: createMarkerElement({
          type: "waypoint",
          className: "translate-waypoint",
        }),
      });

      const subNodes = [subRoutes[0].node1, ...subRoutes.map((el) => el.node2)];

      const routePolyLine = new Polyline({
        map: map,
        path: subNodes.map((el) => {
          return { lat: el.lat, lng: el.lng };
        }),
        strokeColor: "#808080",
      });

      routePolyLine.addListener(
        "click",
        (e: { latLng: google.maps.LatLng }) => {
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

          const newPolyline = new Polyline({
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
            marker1: marker1,
            marker2: marker2,
            polyline: newPolyline,
          });
        }
      );

      const startNode = subRoutes[0].node1;

      new AdvancedMarker({
        map: map,
        position: startNode,
        content: createMarkerElement({
          type: "waypoint",
          className: "translate-waypoint",
        }),
      });
    }
  };

  useEffect(() => {
    if (routes.data) {
      drawRoute(routes.data);
    }
  }, [routes]);

  useEffect(() => {
    if (!map || !mapLoaded) return;
    const universityLatLng = getCurrentUniversityLngLat();
    console.log("Setting center to:", universityLatLng);
    map.setCenter(universityLatLng);
  }, [currentUniversity, mapLoaded]);

  useEffect(() => {
    return () => {
      if (!selectedEdge) return;
      const { marker1, marker2, polyline } = selectedEdge;
      marker1.map = null;
      marker2.map = null;
      polyline.setMap(null);
    };
  }, [selectedEdge]);

  return (
    <MainContainer>
      <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
        <div className="w-full">
          <table className="w-full border border-black table-fixed">
            <tr>
              <th className="text-xl font-bold">선택된 간선 정보</th>{" "}
              <th>ID</th>
            </tr>
            <tr>
              <td>node1 (red)</td> <td>{selectedEdge?.info.node1.nodeId}</td>
            </tr>
            <tr>
              <td>node2 (red)</td> <td>{selectedEdge?.info.node2.nodeId}</td>
            </tr>
            <tr>
              <td>route (black)</td> <td>{selectedEdge?.info.routeId}</td>
            </tr>
          </table>
        </div>
      </div>
      <div className="flex flex-col w-4/5 h-full pb-4 px-1">
        <div
          id="map"
          ref={mapRef}
          style={{ height: "100%", width: "100%" }}
        ></div>
      </div>
    </MainContainer>
  );
};

export default SimulationPage;
