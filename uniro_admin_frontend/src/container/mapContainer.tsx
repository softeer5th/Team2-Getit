import { useEffect, useRef, useState, version } from "react";
import { RevisionDataType, RevisionType } from "../data/types/revision";
import useMap from "../hooks/useMap";
import useUniversity from "../hooks/useUniversity";
import { CoreRoutes } from "../data/types/route";
import { useMutation } from "@tanstack/react-query";

interface MapContainerProps {
	rev: RevisionType;
	data: RevisionDataType | undefined;
}

const dashSymbol = {
	path: "M 0,-1 0,1",
	strokeOpacity: 1,
	scale: 3,
};

const MapContainer = ({ rev, data }: MapContainerProps) => {
	const { university } = useUniversity();
	const { AdvancedMarker, Polyline, map, mapRef } = useMap();
	const cachedRoute = useRef<Map<string, google.maps.Polyline>>(new Map());

	const { mutate } = useMutation({})

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
		if (!data) return;

		for (const polyline of cachedRoute.current.values()) {
			polyline.setMap(null);
		}

		drawRoute(data.routesInfo.coreRoutes);
		drawBuildingRoute(data.routesInfo.buildingRoutes);

		findCachedCoreRoute(data.lostRoutes.coreRoutes);
	}, [map, data])


	useEffect(() => {
		if (!map || !university) return;
		map.setCenter(university.centerPoint)
	}, [map, university])


	return (
		<div className="flex flex-col w-4/5 h-full pb-4 px-1">
			<div className="flex flex-row items-center justify-between w-full h-[50px] px-2">
				<div className="text-kor-heading2">VERSION : {data?.rev} / {rev.revTime.slice(0, 10)}  {rev.revTime.slice(11, -1)}</div>
				<button className="rounded-100 bg-primary-500 py-2 px-4 text-system-skyblue hover:bg-primary-600">
					수정하기
				</button>
			</div>
			<div ref={mapRef} className="w-full h-full" />
		</div>
	);
};

export default MapContainer;
