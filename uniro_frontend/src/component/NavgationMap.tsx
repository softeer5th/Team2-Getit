import { useEffect, useRef } from "react";
import useMap from "../hooks/useMap";
import { NavigationRoute } from "../data/types/route";
import { generateAdvancedMarker } from "../utils/markers/generateAdvancedMarker";

type MapProps = {
	style?: React.CSSProperties;
	routes: NavigationRoute;
	/** 바텀시트나 상단 UI에 의해 가려지는 영역이 있을 경우, 지도 fitBounds에 추가할 패딩값 */
	topPadding?: number;
	bottomPadding?: number;
};

const NavigationMap = ({ style, routes, topPadding = 0, bottomPadding = 0 }: MapProps) => {
	const { mapRef, map, AdvancedMarker, Polyline } = useMap();

	const boundsRef = useRef<google.maps.LatLngBounds | null>(null);

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	useEffect(() => {
		if (!map || !AdvancedMarker || !routes || !Polyline) return;

		const { route: routeList } = routes;
		if (!routeList || routeList.length === 0) return;
		const bounds = new google.maps.LatLngBounds();

		routeList.forEach((edge) => {
			const { startNode, endNode } = edge;
			new Polyline({
				path: [startNode, endNode],
				map,
				strokeColor: "#000000",
				strokeOpacity: 2.0,
			});
			bounds.extend(new google.maps.LatLng(startNode.lat, startNode.lng));
			bounds.extend(new google.maps.LatLng(endNode.lat, endNode.lng));
		});

		routeList.forEach((edge, index) => {
			const { startNode, endNode } = edge;
			if (index !== 0 && index !== routeList.length - 1) {
				if (index === 1) {
					generateAdvancedMarker(map, AdvancedMarker, "sub", {
						lat: startNode.lat,
						lng: startNode.lng,
					});
				}
				generateAdvancedMarker(map, AdvancedMarker, "sub", {
					lat: endNode.lat,
					lng: endNode.lng,
				});
			}
		});

		const edgeRoutes = [routeList[0], routeList[routeList.length - 1]];

		edgeRoutes.forEach((edge, index) => {
			const { startNode, endNode } = edge;
			if (index === 0) {
				generateAdvancedMarker(map, AdvancedMarker, "origin", {
					lat: startNode.lat,
					lng: startNode.lng,
				});
			} else {
				generateAdvancedMarker(map, AdvancedMarker, "destination", {
					lat: endNode.lat,
					lng: endNode.lng,
				});
			}
		});

		boundsRef.current = bounds;
		map.fitBounds(bounds, {
			top: topPadding,
			right: 50,
			bottom: bottomPadding,
			left: 50,
		});
	}, [map, AdvancedMarker, Polyline, routes]);

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
