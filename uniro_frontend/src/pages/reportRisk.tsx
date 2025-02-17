import { MouseEvent, useEffect, useState } from "react";
import useMap from "../hooks/useMap";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import createMarkerElement from "../components/map/mapMarkers";
import { CoreRoute, CoreRoutesList, RouteId } from "../data/types/route";
import { Markers } from "../constant/enum/markerEnum";
import { ClickEvent } from "../data/types/event";
import { LatLngToLiteral } from "../utils/coordinates/coordinateTransform";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";
import centerCoordinate from "../utils/coordinates/centerCoordinate";
import { MarkerTypesWithElement } from "../data/types/marker";
import Button from "../components/customButton";
import { Link } from "react-router";
import { ReportRiskMessage } from "../constant/enum/messageEnum";
import { motion } from "framer-motion";
import AnimatedContainer from "../container/animatedContainer";

import BackButton from "../components/map/backButton";

import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { University } from "../data/types/university";
import { useSuspenseQueries } from "@tanstack/react-query";
import { getAllRoutes } from "../api/route";
import { getAllRisks } from "../api/routes";
import useReportRisk from "../hooks/useReportRisk";
import { CautionIssueType, DangerIssueType } from "../data/types/enum";
import { CautionIssue, DangerIssue } from "../constant/enum/reportEnum";

interface reportMarkerTypes extends MarkerTypesWithElement {
	route: RouteId;
	factors?: DangerIssueType[] | CautionIssueType[];
}

export default function ReportRiskPage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });

	const [reportMarker, setReportMarker] = useState<reportMarkerTypes>();

	const [message, setMessage] = useState<ReportRiskMessage>(ReportRiskMessage.DEFAULT);
	const { setReportRouteId } = useReportRisk();
	const { university } = useUniversityInfo();

	useRedirectUndefined<University | undefined>([university]);

	if (!university) return;

	const result = useSuspenseQueries({
		queries: [
			{
				queryKey: ["routes", university.id],
				queryFn: () => getAllRoutes(university.id),
			},
			{ queryKey: [university.id, "risks"], queryFn: () => getAllRisks(university.id) },
		],
	});

	const [routes, risks] = result;

	const reportRisk = (e: MouseEvent<HTMLAnchorElement>) => {
		if (!reportMarker) {
			e.preventDefault();
			return;
		}

		setReportRouteId(reportMarker.route);
	};

	const resetMarker = (prevMarker: MarkerTypesWithElement) => {
		if (prevMarker.type === Markers.REPORT) {
			prevMarker.element.map = null;
			return;
		} else {
			prevMarker.element.content = createMarkerElement({ type: prevMarker.type });
		}
	};

	const addRiskMarker = () => {
		if (AdvancedMarker === null || map === null) return;
		const { dangerRoutes, cautionRoutes } = risks.data;

		for (const route of dangerRoutes) {
			const { routeId, node1, node2, dangerFactors } = route;
			const type = Markers.DANGER;

			const dangerMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng({
					lat: (node1.lat + node2.lat) / 2,
					lng: (node1.lng + node2.lng) / 2,
				}),
				createMarkerElement({ type }),
				() => {
					setReportMarker((prevMarker) => {
						if (prevMarker) resetMarker(prevMarker);

						return {
							type: Markers.DANGER,
							element: dangerMarker,
							route: routeId,
							factors: dangerFactors,
						};
					});
				},
			);
		}

		for (const route of cautionRoutes) {
			const { routeId, node1, node2, cautionFactors } = route;
			const type = Markers.CAUTION;

			const cautionMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng({
					lat: (node1.lat + node2.lat) / 2,
					lng: (node1.lng + node2.lng) / 2,
				}),
				createMarkerElement({ type }),
				() => {
					setReportMarker((prevMarker) => {
						if (prevMarker) resetMarker(prevMarker);

						return {
							type: Markers.CAUTION,
							element: cautionMarker,
							route: routeId,
							factors: cautionFactors,
						};
					});
				},
			);
		}
	};

	const drawRoute = (coreRouteList: CoreRoutesList) => {
		if (!Polyline || !AdvancedMarker || !map) return;

		for (const coreRoutes of coreRouteList) {
			const { routes: subRoutes } = coreRoutes;

			const subNodes = [subRoutes[0].node1, ...subRoutes.map((el) => el.node2)];

			const routePolyLine = new Polyline({
				map: map,
				path: subNodes.map((el) => {
					return { lat: el.lat, lng: el.lng };
				}),
				strokeColor: "#808080",
			});

			routePolyLine.addListener("click", (e: ClickEvent) => {
				const edges: CoreRoute[] = subRoutes.map(({ routeId, node1, node2 }) => {
					return { routeId, node1, node2 };
				});

				const point = LatLngToLiteral(e.latLng);
				const { edge: nearestEdge, point: nearestPoint } = findNearestSubEdge(edges, point);

				const newReportMarker = createAdvancedMarker(
					AdvancedMarker,
					map,
					centerCoordinate(nearestEdge.node1, nearestEdge.node2),
					createMarkerElement({
						type: Markers.REPORT,
						className: "translate-pinmarker",
						hasAnimation: true,
					}),
				);

				setReportMarker((prevMarker) => {
					if (prevMarker) resetMarker(prevMarker);

					return {
						type: Markers.REPORT,
						element: newReportMarker,
						route: nearestEdge.routeId,
					};
				});
			});
		}
	};

	useEffect(() => {
		drawRoute(routes.data);
		addRiskMarker();

		if (map) {
			map.addListener("click", () => {
				setReportMarker((prevMarker) => {
					if (prevMarker) {
						setMessage(ReportRiskMessage.DEFAULT);
						resetMarker(prevMarker);
					} else setMessage(ReportRiskMessage.ERROR);

					return undefined;
				});
			});
		}
	}, [map, AdvancedMarker, Polyline]);

	useEffect(() => {
		if (message === ReportRiskMessage.ERROR) {
			setTimeout(() => {
				setMessage(ReportRiskMessage.DEFAULT);
			}, 1000);
		}
	}, [message]);

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: reportMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;

		if (isSelect) {
			if (marker.type === Markers.DANGER) {
				marker.element.content = createMarkerElement({
					type: marker.type,
					title: (marker.factors as DangerIssueType[]).map((key) => DangerIssue[key]),
					hasTopContent: true,
				});
			} else if (marker.type === Markers.CAUTION) {
				marker.element.content = createMarkerElement({
					type: marker.type,
					title: (marker.factors as CautionIssueType[]).map((key) => CautionIssue[key]),
					hasTopContent: true,
				});
			}
			return;
		}

		marker.element.content = createMarkerElement({
			type: marker.type,
		});
	};

	/** 선택된 마커가 있는 경우 */
	useEffect(() => {
		if (!reportMarker) return;

		if (reportMarker.type === Markers.REPORT) setMessage(ReportRiskMessage.CREATE);
		else if (reportMarker.type === Markers.DANGER || reportMarker.type === Markers.CAUTION)
			setMessage(ReportRiskMessage.UPDATE);
		else setMessage(ReportRiskMessage.DEFAULT);

		changeMarkerStyle(reportMarker, true);
		return () => {
			changeMarkerStyle(reportMarker, false);
		};
	}, [reportMarker]);

	return (
		<div className="relative w-full h-dvh">
			<div className="w-full h-[57px] flex items-center justify-center absolute top-0 bg-black opacity-50 z-10 py-3 px-4">
				<motion.p
					initial={{ x: 0 }}
					animate={message === ReportRiskMessage.ERROR ? { x: [0, 5, -5, 2.5, -2.5, 0] } : { x: 0 }}
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
				<Link to={"/form"} onClick={reportRisk}>
					<Button>제보하기</Button>
				</Link>
			</AnimatedContainer>
		</div>
	);
}
