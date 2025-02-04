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
import Button from "../components/customButton";
import { Link } from "react-router";
import { ReportHazardMessage } from "../constant/enum/messageEnum";
import { motion } from "framer-motion";
import useReportHazard from "../hooks/useReportHazard";
import AnimatedContainer from "../container/animatedContainer";
import BackButton from "../components/map/backButton";

interface reportMarkerTypes extends MarkerTypesWithElement {
	edge: [google.maps.LatLng | google.maps.LatLngLiteral, google.maps.LatLng | google.maps.LatLngLiteral];
}

export default function ReportHazardPage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });
	const [reportMarker, setReportMarker] = useState<reportMarkerTypes>();
	const { setReportType, setNode } = useReportHazard();

	const [message, setMessage] = useState<ReportHazardMessage>(ReportHazardMessage.DEFAULT);

	const resetMarker = (prevMarker: MarkerTypesWithElement) => {
		if (prevMarker.type === Markers.REPORT) {
			prevMarker.element.map = null;
			return;
		} else {
			prevMarker.element.content = createMarkerElement({ type: prevMarker.type });
		}
	};

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
						hasTopContent: true,
					});
					setMessage(ReportHazardMessage.UPDATE);
					setReportMarker((prevMarker) => {
						if (prevMarker) {
							resetMarker(prevMarker);
						}

						return {
							type,
							element: hazardMarker,
							edge: [startNode, endNode],
						};
					});
				},
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
						className: "translate-routemarker",
						hasAnimation: true,
					}),
				);

				setMessage(ReportHazardMessage.CREATE);

				setReportMarker((prevMarker) => {
					if (prevMarker) {
						resetMarker(prevMarker);
					}

					return {
						type: Markers.REPORT,
						element: newReportMarker,
						edge: nearestEdge,
					};
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

	const reportHazard = () => {
		if (!reportMarker) return;

		setReportType(reportMarker.type === Markers.REPORT ? "CREATE" : "UPDATE");

		setNode(...reportMarker.edge);
	};

	useEffect(() => {
		drawRoute(mockNavigationRoute.route);
		addHazardMarker();

		if (map) {
			map.addListener("click", () => {
				setReportMarker((prevMarker) => {
					if (prevMarker) {
						setMessage(ReportHazardMessage.DEFAULT);
						resetMarker(prevMarker);
					} else setMessage(ReportHazardMessage.ERROR);

					return undefined;
				});
			});
		}
	}, [map, AdvancedMarker, Polyline]);

	useEffect(() => {
		if (message === ReportHazardMessage.ERROR) {
			setTimeout(() => {
				setMessage(ReportHazardMessage.DEFAULT);
			}, 1000);
		}
	}, [message]);

	return (
		<div className="relative w-full h-dvh">
			<div className="w-full h-[57px] flex items-center justify-center absolute top-0 bg-black opacity-50 z-10 py-3 px-4">
				<motion.p
					initial={{ x: 0 }}
					animate={message === ReportHazardMessage.ERROR ? { x: [0, 5, -5, 2.5, -2.5, 0] } : { x: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
					className="text-gray-100 text-kor-body2 font-medium text-center"
				>
					{message}
				</motion.p>
			</div>
			<BackButton className="absolute top-[73px] left-4 z-5" />
			<div ref={mapRef} className="w-full h-full" />
			<AnimatedContainer
				isVisible={reportMarker ? true : false}
				className="absolute w-full bottom-6 px-4"
				positionDelta={88}
				transition={{ duration: 0.6 }}
			>
				<Link onClick={reportHazard} to={"/form"}>
					<Button>제보하기</Button>
				</Link>
			</AnimatedContainer>
		</div>
	);
}
