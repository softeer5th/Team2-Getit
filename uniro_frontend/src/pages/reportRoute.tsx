import { useEffect } from "react";
import createMarkerElement from "../components/map/mapMarkers";
import { Markers } from "../constant/enums";
import { RouteEdge } from "../data/types/edge";
import useMap from "../hooks/useMap";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import { ClickEvent } from "../data/types/event";
import createSubNodes from "../utils/polylines/createSubnodes";
import { LatLngToLiteral } from "../utils/coordinates/coordinateTransform";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";

export default function ReportRoutePage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });

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

			routePolyLine.addListener("click", (e: ClickEvent) => {
				const subNodes = createSubNodes(routePolyLine);

				const edges = subNodes
					.map(
						(node, idx) =>
							[node, subNodes[idx + 1]] as [google.maps.LatLngLiteral, google.maps.LatLngLiteral],
					)
					.slice(0, -1);

				const point = LatLngToLiteral(e.latLng);

				const { edge: nearestEdge, point: nearestPoint } = findNearestSubEdge(edges, point);

				const tempWaypointMarker = new AdvancedMarker({
					map: map,
					position: nearestPoint,
					content: createMarkerElement({
						type: Markers.WAYPOINT,
						className: "translate-waypoint",
					}),
				});
			});
		}

		createAdvancedMarker(
			AdvancedMarker,
			map,
			routes[0].startNode,
			createMarkerElement({ type: Markers.WAYPOINT, className: "translate-waypoint" }),
		);
	};

	useEffect(() => {
		drawRoute(mockNavigationRoute.route);
	}, [map]);

	return (
		<div className="relative w-full h-dvh">
			<div ref={mapRef} className="w-full h-full" />
		</div>
	);
}
