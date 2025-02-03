import { useEffect, useState } from "react";
import useMap from "../hooks/useMap";
import { mockNavigationRoute } from "../data/mock/hanyangRoute";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import createMarkerElement from "../components/map/mapMarkers";
import { RouteEdge } from "../data/types/edge";
import { Markers } from "../constant/enum/markerEnum";
import { mockHazardEdges } from "../data/mock/hanyangHazardEdge";
import { ClickEvent } from "../data/types/event";
import createSubNodes from "../utils/polylines/createSubnodes";
import { LatLngToLiteral } from "../utils/coordinates/coordinateTransform";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";
import centerCoordinate from "../utils/coordinates/centerCoordinate";
import { MarkerTypesWithElement } from "../data/types/marker";

export default function ReportHazardPage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });
	const [reportMarker, setReportMarker] = useState<MarkerTypesWithElement>();

	const addHazardMarker = () => {
		if (AdvancedMarker === null || map === null) return;
		for (const edge of mockHazardEdges) {
			const { id, startNode, endNode, dangerFactors, cautionFactors } = edge;

			const type = dangerFactors ? Markers.DANGER : Markers.CAUTION;

			const hazardMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng({
					lat: (startNode.lat + endNode.lat) / 2,
					lng: (startNode.lng + endNode.lng) / 2,
				}),
				createMarkerElement({ type }),
				() => {
					hazardMarker.content = createMarkerElement({
						type,
						title: dangerFactors ? dangerFactors[0] : cautionFactors && cautionFactors[0],
						hasTopContent: true
					})
					setReportMarker((prevMarker) => {
						if (prevMarker) {
							if (prevMarker.type === Markers.REPORT) {
								prevMarker.element.map = null;
							}
							else {
								prevMarker.element.content = createMarkerElement({ type: prevMarker.type })
							}
						}

						return {
							type,
							element: hazardMarker
						}
					})
				}
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

				const newReportMarker = createAdvancedMarker(
					AdvancedMarker,
					map,
					centerCoordinate(nearestEdge[0], nearestEdge[1]),
					createMarkerElement({
						type: Markers.REPORT,
						className: 'translate-routemarker'
					})
				)

				setReportMarker((prevMarker) => {
					if (prevMarker) {
						if (prevMarker.type === Markers.REPORT) {
							prevMarker.element.map = null;
						}
						else {
							prevMarker.element.content = createMarkerElement({ type: prevMarker.type })
						}
					}
					return {
						type: Markers.REPORT,
						element: newReportMarker
					}
				})
			})
		}

	};


	useEffect(() => {
		drawRoute(mockNavigationRoute.route);
		addHazardMarker();

		if (map) {
			map.addListener('click', () => {
				setReportMarker((prevMarker) => {
					if (prevMarker) {
						if (prevMarker.type === Markers.REPORT) {
							prevMarker.element.map = null;
						}
						else {
							prevMarker.element.content = createMarkerElement({ type: prevMarker.type })
						}
					}
					return undefined
				})
			})
		}
	}, [map, AdvancedMarker, Polyline])

	return (
		<div className="relative w-full h-dvh">
			<div ref={mapRef} className="w-full h-full" />
		</div>
	);
}
