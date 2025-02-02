import { useEffect, useRef, useState } from "react";
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
import { AdvancedMarker } from "../data/types/marker";
import Button from "../components/customButton";

const colors = [
	"#f1a2b3",
	"#4c8dff",
	"#e67e22",
	"#2ecc71",
	"#9b59b6",
	"#34495e",
	"#f39c12",
	"#1abc9c",
	"#d35400",
	"#c0392b",
];

export default function ReportRoutePage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });
	const originPoint = useRef<{ point: google.maps.LatLngLiteral; element: AdvancedMarker } | undefined>();
	const [newPoints, setNewPoints] = useState<{ element: AdvancedMarker | null; coords: google.maps.LatLngLiteral[] }>(
		{
			element: null,
			coords: [],
		},
	);
	const newPolyLine = useRef<google.maps.Polyline>();
	const [isActive, setIsActive] = useState<boolean>(false);

	const reportNewRoute = () => {
		if (!newPolyLine.current || !Polyline) return;

		const subNodes = [];
		const edges = newPoints.coords.map((node, idx) => [node, newPoints.coords[idx + 1]]).slice(0, -1);

		for (const edge of edges) {
			const subNode = createSubNodes(new Polyline({ path: edge }));
			const subEdges = subNode.map((node, idx) => [node, subNode[idx + 1]]).slice(0, -1);

			for (let i = 0; i < subEdges.length; i++) {
				new Polyline({
					map: map,
					path: subEdges[i],
					strokeColor: colors[i % 10],
				});
			}

			subNodes.push(...subNode);
		}

		console.log(subNodes);

		setNewPoints({
			element: null,
			coords: [],
		});
		originPoint.current = undefined;
		newPolyLine.current.setPath([]);
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

				const tempWaypointMarker = createAdvancedMarker(
					AdvancedMarker,
					map,
					nearestPoint,
					createMarkerElement({
						type: Markers.WAYPOINT,
						className: "translate-waypoint",
					}),
				);

				if (originPoint.current) {
					setNewPoints((prevPoints) => {
						if (prevPoints.element) {
							prevPoints.element.position = nearestPoint;
							return {
								...prevPoints,
								coords: [...prevPoints.coords, nearestPoint],
							};
						} else {
							setIsActive(true);
							return {
								element: new AdvancedMarker({
									map: map,
									position: nearestPoint,
									content: createMarkerElement({
										type: Markers.DESTINATION,
									}),
								}),
								coords: [...prevPoints.coords, nearestPoint],
							};
						}
					});
				} else {
					const originMarker = new AdvancedMarker({
						map: map,
						position: nearestPoint,
						content: createMarkerElement({ type: Markers.ORIGIN }),
					});

					originPoint.current = {
						point: nearestPoint,
						element: originMarker,
					};

					setNewPoints({
						element: null,
						coords: [nearestPoint],
					});
				}
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
		if (newPolyLine.current) {
			newPolyLine.current.setPath(newPoints.coords);
		}
	}, [newPoints]);

	useEffect(() => {
		drawRoute(mockNavigationRoute.route);
		if (Polyline) {
			newPolyLine.current = new Polyline({ map: map, path: [], strokeColor: "#0367FB" });
		}

		if (map && AdvancedMarker) {
			map.addListener("click", (e: ClickEvent) => {
				if (originPoint.current) {
					const point = LatLngToLiteral(e.latLng);
					setNewPoints((prevPoints) => {
						if (prevPoints.element) {
							prevPoints.element.position = point;
							return {
								...prevPoints,
								coords: [...prevPoints.coords, point],
							};
						} else {
							setIsActive(true);
							return {
								element: new AdvancedMarker({
									map: map,
									position: point,
									content: createMarkerElement({
										type: Markers.DESTINATION,
									}),
								}),
								coords: [...prevPoints.coords, point],
							};
						}
					});
				}
			});
		}
	}, [map]);

	return (
		<div className="relative w-full h-dvh">
			<div ref={mapRef} className="w-full h-full" />
			{isActive && (
				<div className="absolute w-full bottom-6 px-4">
					<Button onClick={reportNewRoute}>제보하기</Button>
				</div>
			)}
		</div>
	);
}
