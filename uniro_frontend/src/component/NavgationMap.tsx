import { useEffect } from "react";
import useMap from "../hooks/useMap";
import startIcon from "../assets/marker/startIcon.svg?raw";
import arriveMarker from "../assets/marker/arriveMarker.svg?raw";
import subMarker from "../assets/marker/subMarker.svg?raw";
import { to } from "@react-spring/web";
import { NavigationRoute } from "../data/types/route";

// props 타입 정의 (필요 시)
type MapProps = {
	style?: React.CSSProperties;
	// route, startBuilding, destinationBuilding 등을 밖에서 받아온다고 가정
	routes: NavigationRoute[];
};

const generateStartMarker = (
	map: google.maps.Map,
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	position: { lat: number; lng: number },
) => {
	const startSvgElement = new DOMParser().parseFromString(startIcon, "image/svg+xml").documentElement;
	new AdvancedMarker({
		position: position,
		map,
		content: startSvgElement,
		title: "출발지",
	});
};

const NavigationMap = ({ style, routes }: MapProps) => {
	const { mapRef, map, AdvancedMarker, Polyline, mapLoaded } = useMap();

	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	useEffect(() => {
		if (!map) return;
		map.setZoom(18);

		const { route } = routes[0];

		routes.forEach((route, index) => {
			if (index === 0) {
				generateStartMarker(map, AdvancedMarker, {
					lat: route.route[index].startNode.lat,
					lng: route.startBuilding.lng,
				});
			}
		});

		const startSvgElement = new DOMParser().parseFromString(startIcon, "image/svg+xml").documentElement;
		const endSvgElement = new DOMParser().parseFromString(arriveMarker, "image/svg+xml").documentElement;

		const startNode = route[0].startNode;
		const destinationNode = route[route.length - 1].endNode;

		const startMarker = new AdvancedMarker({
			position: { lat: startNode.lat, lng: startNode.lng },
			map,
			content: startSvgElement,
			title: "출발지",
		});

		route.forEach((segment) => {
			const subMarkerElement = new DOMParser().parseFromString(subMarker, "image/svg+xml").documentElement;

			const path = [
				{ lat: segment.startNode.lat, lng: segment.startNode.lng },
				{ lat: segment.endNode.lat, lng: segment.endNode.lng },
			];

			new Polyline({
				path,
				map,
				strokeColor: "#161616", // 원하는 색상
				strokeWeight: "4", // 원하는 두께
			});

			new AdvancedMarker({
				position: { lat: segment.startNode.lat, lng: segment.startNode.lng },
				map,
				content: subMarkerElement,
			});

			new AdvancedMarker({
				position: { lat: segment.endNode.lat, lng: segment.endNode.lng },
				map,
				content: subMarkerElement,
			});
			const endMarker = new AdvancedMarker({
				position: { lat: destinationNode.lat, lng: destinationNode.lng },
				map,
				content: endSvgElement,
				title: "도착지",
			});
		});
	}, [map, route]);

	return <div id="map" ref={mapRef} style={style} />;
};

export default NavigationMap;
