import { useEffect } from "react";
import useMap from "../hooks/useMap";
import startIcon from "../assets/marker/startIcon.svg?raw";
import arriveMarker from "../assets/marker/arriveMarker.svg?raw";
import subMarker from "../assets/marker/subMarker.svg?raw";
import cautionMarker from "../assets/marker/cautionMarker.svg?raw";
import { NavigationRoute } from "../data/types/route";

// props 타입 정의 (필요 시)
type MapProps = {
	style?: React.CSSProperties;
	// route, startBuilding, destinationBuilding 등을 밖에서 받아온다고 가정
	routes: NavigationRoute;
};

const generateMarker = (
	map: google.maps.Map,
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	type: "start" | "sub" | "end" | "caution",
	position: { lat: number; lng: number },
) => {
	if (type === "start") {
		const startSvgElement = new DOMParser().parseFromString(startIcon, "image/svg+xml").documentElement;
		new AdvancedMarker({
			position: position,
			map,
			content: startSvgElement,
			title: "출발지",
		});
	}
	else if (type === "end") {
		const endSvgElement = new DOMParser().parseFromString(arriveMarker, "image/svg+xml").documentElement;
		new AdvancedMarker({
			position: position,
			map,
			content: endSvgElement,
			title: "도착지",
		});
	}
	else if (type === "caution") {
		const cautionSvgElement = new DOMParser().parseFromString(cautionMarker, "image/svg+xml").documentElement;
		new AdvancedMarker({
			position: position,
			map,
			content: cautionSvgElement,
			title: "주의사항",
		});
	}
	else {
		const subMarkerElement = new DOMParser().parseFromString(subMarker, "image/svg+xml").documentElement;
		new AdvancedMarker({
			position: position,
			map,
			content: subMarkerElement,
		});
	}
};

const NavigationMap = ({ style, routes }: MapProps) => {
	const { mapRef, map, AdvancedMarker, Polyline, mapLoaded } = useMap();

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	useEffect(() => {
		if (!map) return;


		if (!routes) return;


		map.setZoom(18);
		// 모든 lat와 lng의 평균값을 중심으로 지도를 보여줌
		const latSum = routes.route.reduce((acc, route) => acc + route.startNode.lat + route.endNode.lat, 0);
		const lngSum = routes.route.reduce((acc, route) => acc + route.startNode.lng + route.endNode.lng, 0);
		const latCenter = latSum / (routes.route.length * 2);
		const lngCenter = lngSum / (routes.route.length * 2);
		map.setCenter({ lat: latCenter, lng: lngCenter });

		routes.route.forEach((route, index) => {
			const { startNode, endNode } = route;

			if (route.cautionFactors && route.cautionFactors.length > 0) {
				generateMarker(map, AdvancedMarker, "caution", {
					lat: (startNode.lat + endNode.lat) / 2,
					lng: (startNode.lng + endNode.lng) / 2
				}
				)
			}
			if (index === 0) {
				generateMarker(map, AdvancedMarker, "start", {
					lat: startNode.lat,
					lng: startNode.lng,
				});
				generateMarker(map, AdvancedMarker, "sub", {
					lat: endNode.lat,
					lng: endNode.lng
				});
			}
			else if (index === routes.route.length - 1) {
				generateMarker(map, AdvancedMarker, "sub", {
					lat: startNode.lat,
					lng: startNode.lng,
				});
				generateMarker(map, AdvancedMarker, "end", {
					lat: endNode.lat,
					lng: endNode.lng
				});

			} else {
				generateMarker(map, AdvancedMarker, "sub", {
					lat: startNode.lat,
					lng: startNode.lng,
				});
				generateMarker(map, AdvancedMarker, "sub", {
					lat: endNode.lat,
					lng: endNode.lng
				});
			}
			new Polyline({
				path: [startNode, endNode],
				map,
				strokeColor: "#000000",
				strokeOpacity: 2.0,
			});
		});
	}, [map, routes]);

	return <div id="map" ref={mapRef} style={style} />;
};

export default NavigationMap;
