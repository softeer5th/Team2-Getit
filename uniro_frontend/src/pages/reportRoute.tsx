import { useEffect, useRef, useState } from "react";
import createMarkerElement from "../components/map/mapMarkers";
import { Markers } from "../constant/enum/markerEnum";
import useMap from "../hooks/useMap";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import { ClickEvent } from "../data/types/event";
import createSubNodes from "../utils/polylines/createSubnodes";
import { LatLngToLiteral } from "../utils/coordinates/coordinateTransform";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";
import { AdvancedMarker } from "../data/types/marker";
import Button from "../components/customButton";
import { CautionToggleButton, DangerToggleButton } from "../components/map/floatingButtons";
import toggleMarkers from "../utils/markers/toggleMarkers";
import BackButton from "../components/map/backButton";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { University } from "../data/types/university";
import { useMutation, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { getAllRoutes, postReportRoute } from "../api/route";
import { CoreRoute, CoreRoutesList, Route, RouteId } from "../data/types/route";
import { Node, NodeId } from "../data/types/node";
import { Coord } from "../data/types/coord";
import useModal from "../hooks/useModal";
import { useNavigate } from "react-router";
import { getAllRisks } from "../api/routes";
import { CautionIssueType, DangerIssueType } from "../data/types/enum";
import { CautionIssue, DangerIssue } from "../constant/enum/reportEnum";

type SelectedMarkerTypes = {
	type: Markers.CAUTION | Markers.DANGER;
	id: RouteId;
	element: AdvancedMarker;
	factors: DangerIssueType[] | CautionIssueType[];
};

export default function ReportRoutePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });
	const originPoint = useRef<{ point: Node; element: AdvancedMarker } | undefined>();
	const [newPoints, setNewPoints] = useState<{ element: AdvancedMarker | null; coords: (Coord | Node)[] }>({
		element: null,
		coords: [],
	});
	const newPolyLine = useRef<google.maps.Polyline>();
	const [isActive, setIsActive] = useState<boolean>(false);

	const [dangerMarkers, setDangerMarkers] = useState<{ element: AdvancedMarker, routeId: RouteId }[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(false);

	const [cautionMarkers, setCautionMarkers] = useState<{ element: AdvancedMarker, routeId: RouteId }[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(false);

	const { university } = useUniversityInfo();
	useRedirectUndefined<University | undefined>([university]);

	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const [SuccessModal, isSuccessOpen, openSuccess, closeSuccess] = useModal(() => { navigate('/map') });
	const [FailModal, isFailOpen, openFail, closeFail] = useModal();

	if (!university) return;

	const result = useSuspenseQueries({
		queries: [
			{
				queryKey: ["routes", university.id],
				queryFn: () => getAllRoutes(university.id),
			},
			{ queryKey: [university.id, 'risks'], queryFn: () => getAllRisks(university.id) },
		]
	});

	const [routes, risks] = result;


	const { mutate } = useMutation({
		mutationFn: ({
			startNodeId,
			coordinates,
			endNodeId,
		}: {
			startNodeId: NodeId;
			endNodeId: NodeId | null;
			coordinates: Coord[];
		}) => postReportRoute(university.id, { startNodeId, endNodeId, coordinates }),
		onSuccess: () => {
			openSuccess();
			if (newPoints.element) newPoints.element.map = null;
			if (originPoint.current) {
				originPoint.current.element.map = null;
				originPoint.current = undefined;
			}
			setNewPoints({
				element: null,
				coords: [],
			});
			if (newPolyLine.current) newPolyLine.current.setPath([]);
			queryClient.invalidateQueries({ queryKey: ["routes", university.id], });
		},
		onError: () => {
			openFail();
			if (newPoints.element) newPoints.element.map = null;
			if (originPoint.current) {
				originPoint.current.element.map = null;
				originPoint.current = undefined;
			}
			setNewPoints({
				element: null,
				coords: [],
			});
			if (newPolyLine.current) newPolyLine.current.setPath([]);
		},
	});

	const addRiskMarker = () => {
		if (AdvancedMarker === null || map === null) return;
		const { dangerRoutes, cautionRoutes } = risks.data;

		/** 위험 마커 생성 */
		const dangerMarkersWithId: { routeId: RouteId; element: AdvancedMarker }[] = [];

		for (const route of dangerRoutes) {
			const { routeId, node1, node2, dangerTypes } = route;
			const type = Markers.DANGER;

			const dangerMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng({
					lat: (node1.lat + node2.lat) / 2,
					lng: (node1.lng + node2.lng) / 2,
				}),
				createMarkerElement({ type }),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker?.id === routeId) return undefined;
						return {
							type: Markers.DANGER,
							element: dangerMarker,
							factors: dangerTypes,
							id: routeId
						}
					})
				},
			);

			dangerMarkersWithId.push({ routeId, element: dangerMarker });
		}
		setDangerMarkers(dangerMarkersWithId);

		/** 주의 마커 생성 */
		const cautionMarkersWithId: { routeId: RouteId; element: AdvancedMarker }[] = [];

		for (const route of cautionRoutes) {
			const { routeId, node1, node2, cautionTypes } = route;
			const type = Markers.CAUTION;

			const cautionMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng({
					lat: (node1.lat + node2.lat) / 2,
					lng: (node1.lng + node2.lng) / 2,
				}),
				createMarkerElement({ type }),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker?.id === routeId) return undefined;
						return {
							type: Markers.CAUTION,
							element: cautionMarker,
							factors: cautionTypes,
							id: routeId
						}
					})
				},
			);
			cautionMarkersWithId.push({ routeId, element: cautionMarker });
		}

		setCautionMarkers(cautionMarkersWithId);
	};

	const toggleCautionButton = () => {
		if (!map) return;
		setIsCautionActive((isActive) => {
			toggleMarkers(!isActive, cautionMarkers.map(marker => marker.element), map);
			return !isActive;
		});
	};
	const toggleDangerButton = () => {
		if (!map) return;
		setIsDangerActive((isActive) => {
			toggleMarkers(!isActive, dangerMarkers.map(marker => marker.element), map);
			return !isActive;
		});
	};

	const reportNewRoute = () => {
		if (!newPolyLine.current || !Polyline) return;

		const subNodes = [];
		const edges = newPoints.coords.map((node, idx) => [node, newPoints.coords[idx + 1]]).slice(0, -1);

		const lastPoint = newPoints.coords[newPoints.coords.length - 1] as Node | Coord;

		for (const edge of edges) {
			const subNode = createSubNodes(new Polyline({ path: edge })).slice(0, -1);
			subNodes.push(...subNode);
		}

		subNodes.push(lastPoint);

		if (!originPoint.current) return;

		if ("nodeId" in lastPoint) {
			mutate({
				startNodeId: originPoint.current.point.nodeId,
				endNodeId: lastPoint.nodeId,
				coordinates: subNodes,
			});
		} else mutate({ startNodeId: originPoint.current.point.nodeId, coordinates: subNodes, endNodeId: null });
	};

	const drawRoute = (coreRouteList: CoreRoutesList) => {
		if (!Polyline || !AdvancedMarker || !map) return;

		for (const coreRoutes of coreRouteList) {
			const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

			// 가장 끝쪽 Core Node 그리기
			const endNode = subRoutes[subRoutes.length - 1].node2;

			createAdvancedMarker(
				AdvancedMarker,
				map,
				endNode,
				createMarkerElement({ type: Markers.WAYPOINT, className: "translate-waypoint" }),
			);

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

			const startNode = subRoutes[0].node1;

			createAdvancedMarker(
				AdvancedMarker,
				map,
				startNode,
				createMarkerElement({ type: Markers.WAYPOINT, className: "translate-waypoint" }),
			);
		}
	};

	useEffect(() => {
		if (newPolyLine.current) {
			newPolyLine.current.setPath(newPoints.coords);
		}
	}, [newPoints]);

	useEffect(() => {
		drawRoute(routes.data);
		addRiskMarker();
		if (Polyline) {
			newPolyLine.current = new Polyline({ map: map, path: [], strokeColor: "#0367FB" });
		}

		if (map && AdvancedMarker) {
			map.addListener("click", (e: ClickEvent) => {
				setSelectedMarker(undefined)
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

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: SelectedMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;


		if (isSelect) {
			if (marker.type === Markers.DANGER) {
				const key = marker.factors[0] as DangerIssueType;
				marker.element.content = createMarkerElement({
					type: marker.type,
					title: key && DangerIssue[key],
					hasTopContent: true,
				});
			}
			else if (marker.type === Markers.CAUTION) {
				const key = marker.factors[0] as CautionIssueType;
				marker.element.content = createMarkerElement({
					type: marker.type,
					title: key && CautionIssue[key],
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
		changeMarkerStyle(selectedMarker, true);
		return () => {
			changeMarkerStyle(selectedMarker, false);
		};
	}, [selectedMarker]);

	return (
		<div className="relative w-full h-dvh">
			<div className="w-full h-[57px] flex items-center justify-center absolute top-0 bg-black opacity-50 z-10 py-3 px-4">
				<p className="text-gray-100 text-kor-body2 font-medium text-center">
					선 위 또는 기존 지점을 선택하세요
				</p>
			</div>
			<BackButton className="absolute top-[73px] left-4 z-5" />
			<div ref={mapRef} className="w-full h-full" />
			{isActive && (
				<div className="absolute w-full bottom-6 px-4">
					<Button onClick={reportNewRoute}>제보하기</Button>
				</div>
			)}
			<div className="absolute right-4 bottom-[90px] space-y-2">
				<CautionToggleButton isActive={isCautionAcitve} onClick={toggleCautionButton} />
				<DangerToggleButton isActive={isDangerAcitve} onClick={toggleDangerButton} />
			</div>
			{isSuccessOpen && (
				<SuccessModal>
					<p className="text-kor-body1 font-bold text-primary-500">새로운 길 제보를 완료했어요!</p>
					<div className="space-y-0">
						<p className="text-kor-body3 font-regular text-gray-700">제보는 바로 반영되지만,</p>
						<p className="text-kor-body3 font-regular text-gray-700">
							더 정확한 정보를 위해 추후 수정될 수 있어요.
						</p>
					</div>
				</SuccessModal>
			)}
			{isFailOpen && (
				<FailModal>
					<p className="text-kor-body1 font-bold text-system-red">경로를 생성하는데 실패하였습니다!</p>
					<div className="space-y-0">
						<p className="text-kor-body3 font-regular text-gray-700">
							선택하신 경로는 생성이 불가능합니다.
						</p>
						<p className="text-kor-body3 font-regular text-gray-700">
							선 위에서 시작하여, 빈 곳을 이어주시기 바랍니다.
						</p>
					</div>
				</FailModal>
			)}
		</div>
	);
}
