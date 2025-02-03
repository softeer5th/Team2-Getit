import { useEffect } from "react";
import useMap from "../hooks/useMap";
import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import createMarkerElement from "../components/map/mapMarkers";
import { RouteEdge } from "../data/types/edge";
import { Markers } from "../constant/enum/markerEnum";
import { mockHazardEdges } from "../data/mock/hanyangHazardEdge";

export default function ReportHazardPage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });

	const addHazardMarker = () => {
		if (AdvancedMarker === null || map === null) return;
		for (const edge of mockHazardEdges) {
			const { id, startNode, endNode, dangerFactors, cautionFactors } = edge;
			const hazardMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng({
					lat: (startNode.lat + endNode.lat) / 2,
					lng: (startNode.lng + endNode.lng) / 2,
				}),
				createMarkerElement({ type: dangerFactors ? Markers.DANGER : Markers.CAUTION }),
			);
		}
	};

	const drawRoute = (routes: RouteEdge[]) => {
		if (!Polyline || !AdvancedMarker || !map) return;

		for (const route of routes) {
			const coreNode = route.endNode;

			createAdvancedMarker(
				AdvancedMarker,
				map,
				coreNode,
				createMarkerElement({ type: Markers.WAYPOINT, className: "translate-waypoint" }),
			);

			const routePolyLine = new Polyline({
				map: map,
				path: [route.startNode, route.endNode],
				strokeColor: "#808080",
			});
		}

	};

	useEffect(() => {
		drawRoute(mockNavigationRoute.route);
		addHazardMarker();
	}, [map, AdvancedMarker, Polyline])

	return (
		<div className="relative w-full h-dvh">
			<div ref={mapRef} className="w-full h-full" />
		</div>
	);
}
