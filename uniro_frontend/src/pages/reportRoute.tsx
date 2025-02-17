import { useEffect, useRef, useState } from "react";
import { Markers } from "../constant/enum/markerEnum";
import useMap from "../hooks/useMap";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";
import { ClickEvent } from "../data/types/event";
import createSubNodes from "../utils/polylines/createSubnodes";
import { LatLngToLiteral } from "../utils/coordinates/coordinateTransform";
import findNearestSubEdge from "../utils/polylines/findNearestEdge";
import { AdvancedMarker } from "../data/types/marker";
import Button from "../components/customButton";
import { CautionToggleButton, DangerToggleButton, ResetButton, UndoButton } from "../components/map/floatingButtons";
import toggleMarkers from "../utils/markers/toggleMarkers";
import BackButton from "../components/map/backButton";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { University } from "../data/types/university";
import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { getAllRoutes, postReportRoute } from "../api/route";
import { CoreRoute, CoreRoutesList, RouteId } from "../data/types/route";
import { Node, NodeId } from "../data/types/node";
import { Coord } from "../data/types/coord";
import useModal from "../hooks/useModal";
import { useNavigate } from "react-router";
import { getAllRisks } from "../api/routes";
import { CautionIssueType, DangerIssueType } from "../data/types/enum";
import { CautionIssue, DangerIssue } from "../constant/enum/reportEnum";
import removeMarkers from "../utils/markers/removeMarkers";
import useMutationError from "../hooks/useMutationError";
import TutorialModal from "../components/map/tutorialModal";
import createMarkerElement from "../utils/markers/createMarkerElement";

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

	const [dangerMarkers, setDangerMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(false);

	const [cautionMarkers, setCautionMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(false);

	const { university } = useUniversityInfo();
	useRedirectUndefined<University | undefined>([university]);

	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const [SuccessModal, isSuccessOpen, openSuccess, closeSuccess] = useModal(() => {
		navigate("/map");
	});
	const [tempWaypoints, setTempWayPoints] = useState<AdvancedMarker[]>([]);
	const [isTutorialShown, setIsTutorialShown] = useState<boolean>(true);

	const { cautionMarkerElement, dangerMarkerElement, waypointMarkerElement, originMarkerElement, destinationMarkerElement } = createMarkerElement();

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

	const [ErrorModal, { mutate, status }] = useMutationError(
		{
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
				setTempWayPoints((prevMarkers) => {
					removeMarkers(prevMarkers);
					return [];
				});
				if (newPolyLine.current) newPolyLine.current.setPath([]);
				queryClient.invalidateQueries({ queryKey: ["routes", university.id] });
			},
			onError: () => {
				if (newPoints.element) newPoints.element.map = null;
				if (originPoint.current) {
					originPoint.current.element.map = null;
					originPoint.current = undefined;
				}
				setNewPoints({
					element: null,
					coords: [],
				});
				setTempWayPoints((prevMarkers) => {
					removeMarkers(prevMarkers);
					return [];
				});
				if (newPolyLine.current) newPolyLine.current.setPath([]);
			},
		},
		undefined,
		{
			fallback: {
				400: {
					mainTitle: "경로를 생성하는데 실패하였습니다!",
					subTitle: [
						"선택하신 경로는 생성이 불가능합니다.",
						"선 위에서 시작하여, 빈 곳을 이어주시기 바랍니다.",
					],
				},
				404: {
					mainTitle: "경로를 생성하는데 실패하였습니다!",
					subTitle: ["선택하신 점이 관리자에 의해 제거되었습니다.", "다른 점을 선택하여 제보 부탁드립니다."],
				},
			},
		},
	);

	const closeTutorial = () => {
		setIsTutorialShown(false);
	};

	const openTutorial = () => {
		setIsTutorialShown(true);
	};

	const addRiskMarker = () => {
		if (AdvancedMarker === null || map === null) return;
		const { dangerRoutes, cautionRoutes } = risks.data;

		/** 위험 마커 생성 */
		const dangerMarkersWithId: { routeId: RouteId; element: AdvancedMarker }[] = [];

		for (const route of dangerRoutes) {
			const { routeId, node1, node2, dangerFactors } = route;
			const type = Markers.DANGER;

			const dangerMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng({
					lat: (node1.lat + node2.lat) / 2,
					lng: (node1.lng + node2.lng) / 2,
				}),
				dangerMarkerElement({}),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker?.id === routeId) return undefined;
						return {
							type: Markers.DANGER,
							element: dangerMarker,
							factors: dangerFactors,
							id: routeId,
						};
					});
				},
			);

			dangerMarkersWithId.push({ routeId, element: dangerMarker });
		}
		setDangerMarkers(dangerMarkersWithId);

		/** 주의 마커 생성 */
		const cautionMarkersWithId: { routeId: RouteId; element: AdvancedMarker }[] = [];

		for (const route of cautionRoutes) {
			const { routeId, node1, node2, cautionFactors } = route;
			const type = Markers.CAUTION;

			const cautionMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng({
					lat: (node1.lat + node2.lat) / 2,
					lng: (node1.lng + node2.lng) / 2,
				}),
				cautionMarkerElement({}),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker?.id === routeId) return undefined;
						return {
							type: Markers.CAUTION,
							element: cautionMarker,
							factors: cautionFactors,
							id: routeId,
						};
					});
				},
			);
			cautionMarkersWithId.push({ routeId, element: cautionMarker });
		}

		setCautionMarkers(cautionMarkersWithId);
	};

	const toggleCautionButton = () => {
		if (!map) return;
		setIsCautionActive((isActive) => {
			toggleMarkers(
				!isActive,
				cautionMarkers.map((marker) => marker.element),
				map,
			);
			return !isActive;
		});
	};
	const toggleDangerButton = () => {
		if (!map) return;
		setIsDangerActive((isActive) => {
			toggleMarkers(
				!isActive,
				dangerMarkers.map((marker) => marker.element),
				map,
			);
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

		mutate({
			startNodeId: originPoint.current.point.nodeId,
			endNodeId: "nodeId" in lastPoint ? lastPoint.nodeId : null,
			coordinates: subNodes,
		});
	};

	const drawRoute = (coreRouteList: CoreRoutesList) => {
		if (!Polyline || !AdvancedMarker || !map) return;

		for (const coreRoutes of coreRouteList) {
			const { coreNode1Id, coreNode2Id, routes: subRoutes } = coreRoutes;

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

				setSelectedMarker(undefined);

				const tempWaypointMarker = createAdvancedMarker(
					AdvancedMarker,
					map,
					nearestPoint,
					waypointMarkerElement({}),
				);

				setTempWayPoints((prevMarkers) => [...prevMarkers, tempWaypointMarker]);

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
									content: destinationMarkerElement({ hasAnimation: true })
								}),
								coords: [...prevPoints.coords, nearestPoint],
							};
						}
					});
				} else {
					const originMarker = new AdvancedMarker({
						map: map,
						position: nearestPoint,
						content: originMarkerElement({ hasAnimation: true }),
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
	};

	/** Undo 함수
	 * 되돌리기 버튼을 누를 경우, 마지막에 생성된 점을 제거
	 * 기존 점의 개수가 1개, 2개, (0개 혹은 3개 이상) 총 3개의 Case를 나눈다.
	 * 1개 : originMarker를 제거하고
	 * 2개 : , 도착마커를 제거한다.
	 * 0개 혹은 3개 이상, 도착마커를 이동시킨다.
	 */
	const undoPoints = () => {
		const deleteNode = [...newPoints.coords].pop();

		if (deleteNode && "nodeId" in deleteNode) {
			setTempWayPoints((prevPoints) => {
				const lastMarker = prevPoints.slice(-1)[0];

				lastMarker.map = null;

				return [...prevPoints.slice(0, -1)];
			});
		}
		if (newPoints.coords.length === 2) {
			setNewPoints((prevPoints) => {
				if (prevPoints.element) prevPoints.element.map = null;
				return {
					element: null,
					coords: [prevPoints.coords[0]],
				};
			});
			setIsActive(false);
			return;
		} else if (newPoints.coords.length === 1) {
			if (originPoint.current) {
				originPoint.current.element.map = null;
			}
			originPoint.current = undefined;
			setNewPoints({
				coords: [],
				element: null,
			});
			return;
		}

		setNewPoints((prevPoints) => {
			const tempPoints = prevPoints.coords.slice(0, -1);
			const lastPoint = tempPoints.slice(-1)[0];
			if (prevPoints.element) prevPoints.element.position = lastPoint;
			return {
				element: prevPoints.element,
				coords: tempPoints,
			};
		});
	};

	/** Reset 함수
	 * 모든 새로운 점 초기화, 시작점 초기화, waypoint 마커 초기화
	 */
	const resetPoints = () => {
		setTempWayPoints((prevPoints) => {
			const lastMarker = prevPoints.slice(-1)[0];

			lastMarker.map = null;

			return [...prevPoints.slice(0, -1)];
		});

		setNewPoints((prev) => {
			if (prev.element) {
				prev.element.map = null;
			}
			return {
				element: null,
				coords: [],
			};
		});
		if (originPoint.current) {
			originPoint.current.element.map = null;
		}
		setIsActive(false);
		originPoint.current = undefined;
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
			map.setCenter(university.centerPoint);
			map.addListener("click", (e: ClickEvent) => {
				setSelectedMarker(undefined);
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
									content: destinationMarkerElement({})
								}),
								coords: [...prevPoints.coords, point],
							};
						}
					});
				} else {
					openTutorial();
				}
			});
		}
	}, [map]);

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: SelectedMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;
		if (marker.type === Markers.DANGER) {
			if (isSelect) {
				marker.element.content = dangerMarkerElement({ factors: (marker.factors as DangerIssueType[]).map((key) => DangerIssue[key]) });
				return;
			}

			marker.element.content = dangerMarkerElement({});
			return;
		}
		if (marker.type === Markers.CAUTION) {
			if (isSelect) {
				marker.element.content = cautionMarkerElement({ factors: (marker.factors as CautionIssueType[]).map((key) => CautionIssue[key]) });
				return;
			}

			marker.element.content = cautionMarkerElement({});
			return;
		}
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
			{isTutorialShown && (
				<TutorialModal onClose={closeTutorial} messages={["회색 선에서 시작할 점을 선택해주세요"]} />
			)}
			<BackButton className="absolute top-4 left-4 z-5" />
			<div ref={mapRef} className="w-full h-full" />
			{isActive && (
				<div className="absolute w-full bottom-6 px-4">
					<Button
						onClick={reportNewRoute}
						variant={status === "pending" || status === "success" ? "disabled" : "primary"}
					>
						{status === "pending" ? "제보하는 중.." : "제보하기"}
					</Button>
				</div>
			)}
			<div className="absolute right-4 bottom-[90px] space-y-2">
				<ResetButton disabled={newPoints.coords.length === 0} onClick={resetPoints} />
				<UndoButton disabled={newPoints.coords.length === 0} onClick={undoPoints} />
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
			<ErrorModal />
		</div>
	);
}
