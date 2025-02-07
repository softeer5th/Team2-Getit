import { useEffect, useRef } from "react";
import useMap from "../hooks/useMap";
import { CautionRoute, DangerRoute, NavigationRouteList } from "../data/types/route";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import createMarkerElement from "../components/map/mapMarkers";
import { Markers } from "../constant/enum/markerEnum";
import { Coord } from "../data/types/coord";
import useRoutePoint from "../hooks/useRoutePoint";
import { AdvancedMarker } from "../data/types/marker";

type MapProps = {
	style?: React.CSSProperties;
	routeResult: NavigationRouteList;
	risks: {
		dangerRoutes: DangerRoute[];
		cautionRoutes: CautionRoute[];
	};
	isDetailView: boolean;
	topPadding?: number;
	bottomPadding?: number;
};

// TODO: useEffect로 경로가 모두 로딩된 이후에 마커가 생성되도록 수정하기
// TODO: 경로 로딩 완료시 살짝 zoomIn 하는 부분 구현하기

const NavigationMap = ({ style, routeResult, risks, isDetailView, topPadding = 0, bottomPadding = 0 }: MapProps) => {
	const { mapRef, map, AdvancedMarker, Polyline } = useMap();
	const { origin, destination } = useRoutePoint();

	const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
	const markersRef = useRef<AdvancedMarker[]>([]);

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	useEffect(() => {
		if (!mapRef || !map || !AdvancedMarker || !routeResult || !Polyline) return;

		if (routeResult.routes.length === 0) return;

		const paths: Coord[] = [];
		const cautionFactor: Coord[] = [];

		const { routes, routeDetails } = routeResult;

		// 하나의 길 완성
		paths.push(routes[0].node1);
		routes.forEach((route) => {
			const { node2 } = route;
			paths.push(node2);
		});

		const bounds = new google.maps.LatLngBounds();

		new Polyline({
			path: [...paths],
			map,
			strokeColor: "#000000",
			strokeWeight: 2.0,
		});

		// waypoint 마커 찍기
		routeDetails.forEach((routeDetail, index) => {
			const { coordinates } = routeDetail;
			bounds.extend(coordinates);
			const markerElement = createMarkerElement({
				type: Markers.WAYPOINT,
				className: "translate-waypoint",
			});
			createAdvancedMarker(AdvancedMarker, map, coordinates, markerElement);
		});

		// 시작 마커는 출발지 빌딩 표시
		const startMarkerElement = createMarkerElement({
			type: Markers.ORIGIN,
			title: origin?.buildingName,
			className: "translate-routemarker",
			hasAnimation: true,
		});
		const { lat: originLat, lng: originLng }: google.maps.LatLngLiteral = origin!;
		const originCoord = { lat: originLat, lng: originLng };
		createAdvancedMarker(AdvancedMarker, map, originCoord, startMarkerElement);
		bounds.extend(originCoord);

		// 끝 마커는 도착지 빌딩 표시
		const endMarkerElement = createMarkerElement({
			type: Markers.DESTINATION,
			title: destination?.buildingName,
			className: "translate-routemarker",
			hasAnimation: true,
		});

		// 위험요소 마커 찍기
		// risks.dangerRoutes.forEach((route) => {
		// 	const { node1, node2, dangerTypes } = route;
		// 	const type = Markers.DANGER;

		// 	createAdvancedMarker(
		// 		AdvancedMarker,
		// 		map,
		// 		new google.maps.LatLng({
		// 			lat: (node1.lat + node2.lat) / 2,
		// 			lng: (node1.lng + node2.lng) / 2,
		// 		}),
		// 		createMarkerElement({ type }),
		// 	);
		// });

		const { lat: destinationLat, lng: destinationLng }: google.maps.LatLngLiteral = destination!;
		const destinationCoord = { lat: destinationLat, lng: destinationLng };
		createAdvancedMarker(AdvancedMarker, map, destinationCoord, endMarkerElement);
		bounds.extend(destinationCoord);

		cautionFactor.forEach((coord) => {
			const markerElement = createMarkerElement({
				type: Markers.CAUTION,
				hasAnimation: true,
			});
			createAdvancedMarker(AdvancedMarker, map, coord, markerElement);
		});

		boundsRef.current = bounds;

		map.fitBounds(bounds, {
			top: topPadding,
			right: 30,
			bottom: bottomPadding,
			left: 30,
		});
	}, [mapRef, map, AdvancedMarker, Polyline, routeResult]);

	useEffect(() => {
		if (!map || !boundsRef.current) return;
		map.fitBounds(boundsRef.current, {
			top: topPadding,
			right: 30,
			bottom: bottomPadding,
			left: 30,
		});
	}, [map, bottomPadding, topPadding]);

	useEffect(() => {
		if (!AdvancedMarker || !map) return;

		if (isDetailView) {
			const { routeDetails } = routeResult;
			markersRef.current = [];

			routeDetails.forEach((routeDetail, index) => {
				const { coordinates } = routeDetail;
				const markerElement = createMarkerElement({
					type: Markers.NUMBERED_WAYPOINT,
					number: index + 1,
					hasAnimation: true,
				});

				const marker = createAdvancedMarker(AdvancedMarker, map, coordinates, markerElement);

				markersRef.current.push(marker);
			});
		}

		return () => {
			markersRef.current.forEach((marker) => {
				const markerElement = marker.content as HTMLElement;
				if (markerElement) {
					markerElement.classList.add("fade-out");
					setTimeout(() => {
						marker.map = null;
					}, 300);
				} else {
					marker.map = null;
				}
			});
			markersRef.current = [];
		};
	}, [isDetailView, AdvancedMarker, map]);

	return <div id="map" ref={mapRef} style={style} />;
};

export default NavigationMap;
