import { useEffect, useRef } from "react";
import useMap from "../hooks/useMap";
import { CoreRoutes } from "../data/types/route";
import { RevisionDataType } from "../data/types/revision";
import { Coord } from "../data/types/coord";

const dashSymbol = {
    path: "M 0,-1 0,1",
    strokeOpacity: 1,
    scale: 3,
};

interface LogMapProps {
    center: Coord | undefined,
    revisionData: RevisionDataType | undefined;
}

export default function LogMap({ center, revisionData }: LogMapProps) {
    const { AdvancedMarker, Polyline, map, mapRef } = useMap();
    const cachedRoute = useRef<Map<string, google.maps.Polyline>>(new Map());


    const drawBuildingRoute = (coreRouteList: CoreRoutes[]) => {
        if (!Polyline || !AdvancedMarker || !map) return;

        for (const coreRoutes of coreRouteList) {
            const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

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
        }
    };

    const drawRoute = (coreRouteList: CoreRoutes[]) => {
        if (!Polyline || !AdvancedMarker || !map) return;

        // const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
        for (const coreRoutes of coreRouteList) {
            const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

            const routeIds = subRoutes.map(el => el.routeId)

            const key = coreNode1Id < coreNode2Id ? routeIds.join('_') : routeIds.reverse().join('_')

            if (cachedRoute.current.has(key)) {
                const cachedPolyline = cachedRoute.current.get(key);
                if (!cachedPolyline) continue;

                cachedPolyline.setMap(map);
                cachedPolyline.setOptions({
                    strokeColor: "#808080"
                })
                continue;
            }

            const subNodes = [subRoutes[0].node1, ...subRoutes.map((el) => el.node2)];

            const routePolyLine = new Polyline({
                map: map,
                path: subNodes.map((el) => {
                    return { lat: el.lat, lng: el.lng };
                }),
                strokeColor: "#808080",
                geodesic: true
            });


            routePolyLine.addListener('click', () => {
                console.log(coreNode1Id, coreNode2Id)
            })

            cachedRoute.current.set(key, routePolyLine);
        }
    };

    const findCachedCoreRoute = (coreRouteList: CoreRoutes[]) => {
        if (!Polyline) return;

        for (const coreRoutes of coreRouteList) {
            const { coreNode1Id, coreNode2Id, routes } = coreRoutes;

            const routeIds = routes.map(el => el.routeId)

            const key = coreNode1Id < coreNode2Id ? routeIds.join('_') : routeIds.reverse().join('_')

            if (cachedRoute.current.has(key)) {
                const polyline = cachedRoute.current.get(key);

                if (!polyline) return;

                polyline.setMap(map);
                polyline.setOptions({
                    strokeColor: "red"
                })

                continue;
            }

            const subNodes = [routes[0].node1, ...routes.map((el) => el.node2)];

            const routePolyLine = new Polyline({
                map: map,
                path: subNodes.map((el) => {
                    return { lat: el.lat, lng: el.lng };
                }),
                strokeOpacity: 0.5,
                strokeColor: "red",
                geodesic: true
            });

            cachedRoute.current.set(key, routePolyLine);
        }
    }

    useEffect(() => {
        if (!revisionData) return;

        for (const polyline of cachedRoute.current.values()) {
            polyline.setMap(null);
        }

        drawRoute(revisionData.routesInfo.coreRoutes);
        drawBuildingRoute(revisionData.routesInfo.buildingRoutes);

        findCachedCoreRoute(revisionData.lostRoutes.coreRoutes);
    }, [map, revisionData])


    useEffect(() => {
        if (!map || !center) return;
        map.setCenter(center)
    }, [map])


    return (
        <div ref={mapRef} className="w-full h-full" />
    )
}