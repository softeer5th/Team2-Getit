import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import useMap from "../hooks/useMap";
import { CautionRoute, CoreRoutes, DangerRoute } from "../data/types/route";
import { ChangedRouteType, ChangedRouteWithNodeType, ChangedType, RevisionDataType } from "../data/types/revision";
import { Coord } from "../data/types/coord";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import centerCoordinate from "../utils/coordinates/centerCoordinate";
import createMarkerElement from "../utils/markers/createMarkerElement";
import { Markers } from "../constant/enum/markerEnum";
import { ChangedInfo } from "../container/mapContainer";
const dashSymbol = {
    path: "M 0,-1 0,1",
    strokeOpacity: 1,
    scale: 3,
};

interface LogMapProps {
    setInfo: Dispatch<SetStateAction<ChangedInfo | undefined>>;
    center: Coord | undefined;
    revisionData: RevisionDataType | undefined;
}

type RevisionMarkerTypes = "DEFAULT" | "CHANGED" | "REMOVED" | "CREATED";

type MarkerCacheType = Partial<Record<RevisionMarkerTypes, google.maps.marker.AdvancedMarkerElement>>;

export default function LogMap({ center, revisionData, setInfo }: LogMapProps) {
    const { AdvancedMarker, Polyline, map, mapRef } = useMap();
    const cachedRoute = useRef<Map<string, google.maps.Polyline>>(new Map());
    const cachedMarker = useRef<Map<number, MarkerCacheType>>(new Map());
    const {
        cautionMarkerElement,
        dangerMarkerElement,
        changedMarkerElement,
        removedMarkerElement,
        createdMarkerElement,
    } = createMarkerElement();

    const addRiskMarkers = (type: Markers.DANGER | Markers.CAUTION, routes: DangerRoute[] | CautionRoute[]) => {
        if (!AdvancedMarker) return;

        if (type === Markers.DANGER) {
            (routes as DangerRoute[]).forEach((route) => {
                const { routeId } = route;

                if (cachedMarker.current.has(routeId)) {
                    const markers = cachedMarker.current.get(routeId);
                    if (!markers) return;

                    markers.DEFAULT!.map = map;

                    return;
                }

                const dangerMarker = createAdvancedMarker(
                    AdvancedMarker,
                    map,
                    centerCoordinate(route.node1, route.node2),
                    dangerMarkerElement({}),
                );

                cachedMarker.current.set(routeId, { DEFAULT: dangerMarker });
            });
            return;
        }

        if (type === Markers.CAUTION) {
            (routes as CautionRoute[]).forEach((route) => {
                const { routeId } = route;

                if (cachedMarker.current.has(routeId)) {
                    const markers = cachedMarker.current.get(routeId);
                    if (!markers) return;

                    markers.DEFAULT!.map = map;

                    return;
                }

                const cautionMarker = createAdvancedMarker(
                    AdvancedMarker,
                    map,
                    centerCoordinate(route.node1, route.node2),
                    cautionMarkerElement({}),
                );

                cachedMarker.current.set(routeId, { DEFAULT: cautionMarker });
            });
            return;
        }
    };

    const drawBuildingRoute = (coreRouteList: CoreRoutes[]) => {
        if (!Polyline || !AdvancedMarker || !map) return;

        for (const coreRoutes of coreRouteList) {
            const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

            const routeIds = subRoutes.map((el) => el.routeId);

            const key = coreNode1Id < coreNode2Id ? routeIds.join("_") : routeIds.reverse().join("_");

            if (cachedRoute.current.has(key)) {
                const polyline = cachedRoute.current.get(key);

                if (!polyline) return;

                polyline.setMap(map);

                continue;
            }

            const subNodes = [subRoutes[0].node1, ...subRoutes.map((el) => el.node2)];

            const routePolyLine = new Polyline({
                map: map,
                path: subNodes.map((el) => {
                    return { lat: el.lat, lng: el.lng };
                }),
                strokeOpacity: 0,
                strokeColor: "#808080",
                icons: [
                    {
                        icon: dashSymbol,
                        offset: "0",
                        repeat: "20px",
                    },
                ],
                geodesic: true,
            });

            cachedRoute.current.set(key, routePolyLine);
        }
    };

    const drawRoute = (coreRouteList: CoreRoutes[]) => {
        if (!Polyline || !AdvancedMarker || !map) return;

        // const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
        for (const coreRoutes of coreRouteList) {
            const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

            const routeIds = subRoutes.map((el) => el.routeId);

            const key = coreNode1Id < coreNode2Id ? routeIds.join("_") : routeIds.reverse().join("_");

            if (cachedRoute.current.has(key)) {
                const cachedPolyline = cachedRoute.current.get(key);
                if (!cachedPolyline) continue;

                cachedPolyline.setMap(map);
                cachedPolyline.setOptions({
                    strokeColor: "#808080",
                });
                continue;
            }

            const subNodes = [subRoutes[0].node1, ...subRoutes.map((el) => el.node2)];

            const routePolyLine = new Polyline({
                map: map,
                path: subNodes.map((el) => {
                    return { lat: el.lat, lng: el.lng };
                }),
                strokeColor: "#808080",
                geodesic: true,
            });

            cachedRoute.current.set(key, routePolyLine);
        }
    };

    const findCachedCoreRoute = (coreRouteList: CoreRoutes[]) => {
        if (!Polyline) return;

        for (const coreRoutes of coreRouteList) {
            const { coreNode1Id, coreNode2Id, routes } = coreRoutes;

            const routeIds = routes.map((el) => el.routeId);

            const key = coreNode1Id < coreNode2Id ? routeIds.join("_") : routeIds.reverse().join("_");

            if (cachedRoute.current.has(key)) {
                const polyline = cachedRoute.current.get(key);

                if (!polyline) return;

                polyline.setMap(map);
                polyline.setOptions({
                    strokeColor: "red",
                });

                continue;
            }

            const subNodes = [routes[0].node1, ...routes.map((el) => el.node2)];

            const routePolyLine = new Polyline({
                map: map,
                path: subNodes.map((el) => {
                    return { lat: el.lat, lng: el.lng };
                }),
                strokeColor: "red",
                geodesic: true,
            });

            cachedRoute.current.set(key, routePolyLine);
        }
    };

    const typeofChanged = (changed: ChangedRouteType): RevisionMarkerTypes => {
        const { current: 최신버전, difference: 현재버전 } = changed;

        const 최신버전_요소_개수 = 최신버전.dangerFactors.length + 최신버전.cautionFactors.length;
        const 현재버전_요소_개수 = 현재버전.dangerFactors.length + 현재버전.cautionFactors.length;

        if (최신버전_요소_개수 === 0) return "REMOVED";

        if (현재버전_요소_개수 === 0) return "CREATED";

        return "CHANGED";
    };

    const addChangedMarkers = (changedList: (ChangedRouteWithNodeType | undefined)[]) => {
        if (!AdvancedMarker) return;

        for (const changed of changedList) {
            if (!changed) continue;

            const { routeId, node1, node2 } = changed;
            const type = typeofChanged(changed);

            if (cachedMarker.current.has(routeId)) {
                const markerRecord = cachedMarker.current.get(routeId)!;

                if (type in markerRecord) {
                    markerRecord[type]!.map = map;
                    continue;
                }

                let element = null;

                switch (type) {
                    case "CHANGED":
                        element = changedMarkerElement({});
                        break;
                    case "REMOVED":
                        element = removedMarkerElement({});
                        break;
                    case "CREATED":
                        element = createdMarkerElement({});
                        break;
                    default:
                        element = changedMarkerElement({});
                        break;
                }

                const position = markerRecord.DEFAULT!.position;
                const changedMarker = createAdvancedMarker(AdvancedMarker, map, position!, element);

                if (type === "CHANGED") {
                    changedMarker.addListener("click", () => setInfo(changed));
                }

                markerRecord[type] = changedMarker;
                continue;
            }

            let element = null;

            switch (type) {
                case "CHANGED":
                    element = changedMarkerElement({});
                    break;
                case "REMOVED":
                    element = removedMarkerElement({});
                    break;
                case "CREATED":
                    element = createdMarkerElement({});
                    break;
                default:
                    element = changedMarkerElement({});
                    break;
            }

            const marker = createAdvancedMarker(AdvancedMarker, map, centerCoordinate(node1, node2), element);

            cachedMarker.current.set(routeId, { [type]: marker });
        }
    };

    useEffect(() => {
        if (!revisionData) return;

        for (const polyline of cachedRoute.current.values()) {
            polyline.setMap(null);
        }
        for (const record of cachedMarker.current.values()) {
            if ("DEFAULT" in record) {
                record["DEFAULT"]!.map = null;
            }
            if ("CREATED" in record) {
                record["CREATED"]!.map = null;
            }
            if ("REMOVED" in record) {
                record["REMOVED"]!.map = null;
            }
            if ("CHANGED" in record) {
                record["CHANGED"]!.map = null;
            }
        }

        drawRoute(revisionData.routesInfo.coreRoutes);
        drawBuildingRoute(revisionData.routesInfo.buildingRoutes);
        addRiskMarkers(Markers.DANGER, revisionData.risksInfo.dangerRoutes);
        addRiskMarkers(Markers.CAUTION, revisionData.risksInfo.cautionRoutes);

        findCachedCoreRoute(revisionData.lostRoutes.coreRoutes);
        addChangedMarkers(revisionData.changedList);
    }, [map, revisionData]);

    useEffect(() => {
        if (!map || !center) return;
        map.setCenter(center);
    }, [map]);

    return <div ref={mapRef} className="w-full h-full" />;
}
