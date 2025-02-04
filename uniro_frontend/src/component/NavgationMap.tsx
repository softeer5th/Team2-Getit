import { useEffect, useRef } from "react";
import useMap from "../hooks/useMap";
import { NavigationRoute } from "../data/types/route";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import createMarkerElement from "../components/map/mapMarkers";
import { Markers } from "../constant/enum/markerEnum";
import useSuspenseMap from "../hooks/useSuspenseMap";

type MapProps = {
	style?: React.CSSProperties;
	routes: NavigationRoute;
	/** 바텀시트나 상단 UI에 의해 가려지는 영역이 있을 경우, 지도 fitBounds에 추가할 패딩값 */
	topPadding?: number;
	bottomPadding?: number;
};

// TODO: useEffect로 경로가 모두 로딩된 이후에 마커가 생성되도록 수정하기
// TODO: 경로 로딩 완료시 살짝 zoomIn 하는 부분 구현하기

const NavigationMap = ({ style, routes, topPadding = 0, bottomPadding = 0 }: MapProps) => {
	const { mapRef, map, AdvancedMarker, Polyline } = useSuspenseMap();

	const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	useEffect(() => {
		if (!mapRef || !map || !AdvancedMarker || !routes || !Polyline) return;

		const { route: routeList } = routes;
		if (!routeList || routeList.length === 0) return;
		const bounds = new google.maps.LatLngBounds();

		new Polyline({
			path: [...routeList.map((edge) => edge.startNode), routeList[routeList.length - 1].endNode],
			map,
			strokeColor: "#000000",
			strokeWeight: 2.0,
		});

		routeList.forEach((edge, index) => {
			const { startNode, endNode } = edge;
			const startCoordinate = new google.maps.LatLng(startNode.lat, startNode.lng);
			const endCoordinate = new google.maps.LatLng(endNode.lat, endNode.lng);
			bounds.extend(startCoordinate);
			bounds.extend(endCoordinate);
			if (index !== 0 && index !== routeList.length - 1) {
				const markerElement = createMarkerElement({
					type: Markers.WAYPOINT,
					className: "translate-waypoint",
				});
				if (index === 1) {
					createAdvancedMarker(AdvancedMarker, map, startCoordinate, markerElement);
				}
				createAdvancedMarker(AdvancedMarker, map, endCoordinate, markerElement);
			}
		});

		const edgeRoutes = [routeList[0], routeList[routeList.length - 1]];

		edgeRoutes.forEach((edge, index) => {
			const { startNode, endNode } = edge;
			if (index === 0) {
				const startCoordinate = new google.maps.LatLng(startNode.lat, startNode.lng);
				const markerElement = createMarkerElement({
					type: Markers.ORIGIN,
					title: routes.originBuilding.buildingName,
					className: "translate-routemarker",
					hasAnimation: true,
				});
				createAdvancedMarker(AdvancedMarker, map, startCoordinate, markerElement);
				bounds.extend(startCoordinate);
			} else {
				const endCoordinate = new google.maps.LatLng(endNode.lat, endNode.lng);
				const markerElement = createMarkerElement({
					type: Markers.DESTINATION,
					title: routes.destinationBuilding.buildingName,
					className: "translate-routemarker",
					hasAnimation: true,
				});
				createAdvancedMarker(AdvancedMarker, map, endCoordinate, markerElement);
				bounds.extend(endCoordinate);
			}
		});

		boundsRef.current = bounds;
		map.fitBounds(bounds, {
			top: topPadding,
			right: 50,
			bottom: bottomPadding,
			left: 50,
		});
	}, [mapRef, map, AdvancedMarker, Polyline, routes]);

	useEffect(() => {
		if (!map || !boundsRef.current) return;
		map.fitBounds(boundsRef.current, {
			top: topPadding,
			right: 50,
			bottom: bottomPadding,
			left: 50,
		});
	}, [map, bottomPadding, topPadding]);

	return <div id="map" ref={mapRef} style={style} />;
};

export default NavigationMap;
