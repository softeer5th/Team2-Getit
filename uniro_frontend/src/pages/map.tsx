import { useEffect, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import createMarkerElement from "../components/map/mapMarkers";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import { Building, NodeId } from "../data/types/node";
import "react-spring-bottom-sheet/dist/style.css";
import { MapBottomSheetFromList, MapBottomSheetFromMarker } from "../components/map/mapBottomSheet";
import TopSheet from "../components/map/TopSheet";
import { CautionToggleButton, DangerToggleButton } from "../components/map/floatingButtons";
import ReportButton from "../components/map/reportButton";
import useRoutePoint from "../hooks/useRoutePoint";
import useSearchBuilding from "../hooks/useSearchBuilding";
import Button from "../components/customButton";
import { AdvancedMarker } from "../data/types/marker";
import { RouteId, RoutePointType } from "../data/types/route";
import { RoutePoint } from "../constant/enum/routeEnum";
import { Markers } from "../constant/enum/markerEnum";
import createAdvancedMarker, { createUniversityMarker } from "../utils/markers/createAdvanedMarker";
import toggleMarkers from "../utils/markers/toggleMarkers";
import { useNavigate } from "react-router";
import useModal from "../hooks/useModal";
import ReportModal from "../components/map/reportModal";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { HanyangUniversity } from "../constant/university";
import { University } from "../data/types/university";
import { CautionIssueType, DangerIssueType, MarkerTypes } from "../data/types/enum";
import { CautionIssue, DangerIssue } from "../constant/enum/reportEnum";

/** API 호출 */
import { useQuery, useSuspenseQueries } from "@tanstack/react-query";
import { getAllRisks } from "../api/routes";
import { getAllBuildings } from "../api/nodes";
import { getNavigationResult } from "../api/route";
import useQueryError from "../hooks/useQueryError";

export type SelectedMarkerTypes = {
	type: MarkerTypes;
	id: NodeId | RouteId;
	element: AdvancedMarker;
	property?: Building;
	factors?: DangerIssueType[] | CautionIssueType[];
	from: "Marker" | "List";
};

export default function MapPage() {
	const { mapRef, map, AdvancedMarker } = useMap();
	const [zoom, setZoom] = useState<number>(16);
	const prevZoom = useRef<number>(16);

	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const [sheetOpen, setSheetOpen] = useState<boolean>(false);

	const [buildingMarkers, setBuildingMarkers] = useState<{ element: AdvancedMarker; nodeId: NodeId }[]>([]);

	const [dangerMarkers, setDangerMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(false);

	const [cautionMarkers, setCautionMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(false);

	const [universityMarker, setUniversityMarker] = useState<AdvancedMarker>();

	const { origin, setOrigin, destination, setDestination } = useRoutePoint();
	const { mode, building: selectedBuilding } = useSearchBuilding();

	const [_, isOpen, open, close] = useModal();

	const { university } = useUniversityInfo();
	useRedirectUndefined<University | undefined>([university]);

	const navigate = useNavigate();
	if (!university) return;

	const [FailModal, { status, data, refetch: findFastRoute }] = useQueryError({
		queryKey: ['fastRoute', university.id, origin?.nodeId, destination?.nodeId],
		queryFn: () => getNavigationResult(university.id, origin ? origin?.nodeId : -1, destination ? destination?.nodeId : -1),
		enabled: false,
		retry: 0,
	},
		undefined,
		() => { navigate('/result') },
		{
			fallback: {
				400: {
					mainTitle: "잘못된 요청입니다.", subTitle: ["새로고침 후 다시 시도 부탁드립니다."]
				},
				404: {
					mainTitle: "해당 경로를 찾을 수 없습니다.", subTitle: ["해당 건물이 길이랑 연결되지 않았습니다."]
				},
				422: {
					mainTitle: "해당 경로를 찾을 수 없습니다.", subTitle: ["위험 요소 버튼을 클릭하여,", "통행할 수 없는 원인을 파악하실 수 있습니다."]
				}
			}
		}
	)

	const results = useSuspenseQueries({
		queries: [
			{ queryKey: [university.id, "risks"], queryFn: () => getAllRisks(university.id) },
			{
				queryKey: [university.id, "buildings"],
				queryFn: () =>
					getAllBuildings(university.id, {
						leftUpLat: 38,
						leftUpLng: 127,
						rightDownLat: 37,
						rightDownLng: 128,
					}),
			},
		],
	});

	const [risks, buildings] = results;

	const initMap = () => {
		if (map === null || !AdvancedMarker) return;
		map.addListener("click", (e: unknown) => {
			setSheetOpen(false);
			setSelectedMarker(undefined);
		});
		map.addListener("zoom_changed", () => {
			setZoom((prev) => {
				const curZoom = map.getZoom() as number;
				prevZoom.current = prev;

				return curZoom;
			});
		});

		const centerMarker = createUniversityMarker(
			AdvancedMarker,
			map,
			HanyangUniversity,
			university ? university.name : "",
		);
		setUniversityMarker(centerMarker);
	};

	const addBuildings = () => {
		if (AdvancedMarker === null || map === null) return;

		const buildingList = buildings.data;
		const buildingMarkersWithID: { nodeId: NodeId; element: AdvancedMarker }[] = [];

		for (const building of buildingList) {
			const { nodeId, lat, lng, buildingName } = building;

			const buildingMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng(lat, lng),
				createMarkerElement({ type: Markers.BUILDING, title: buildingName, className: "translate-marker" }),
				() => {
					setSelectedMarker({
						id: nodeId,
						type: Markers.BUILDING,
						element: buildingMarker,
						property: building,
						from: "Marker",
					});
				},
			);

			buildingMarkersWithID.push({ nodeId: nodeId ? nodeId : -1, element: buildingMarker });
		}

		setBuildingMarkers(buildingMarkersWithID);
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
				createMarkerElement({ type }),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker && prevMarker.id === routeId) {
							return undefined;
						}
						return {
							id: routeId,
							type: type,
							element: dangerMarker,
							factors: dangerFactors,
							from: "Marker",
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
				createMarkerElement({ type }),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker && prevMarker.id === routeId) {
							return undefined;
						}
						return {
							id: routeId,
							type: type,
							element: cautionMarker,
							factors: cautionFactors,
							from: "Marker",
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
		if (zoom <= 16) {
			map.setOptions({
				zoom: 17,
				center: HanyangUniversity,
			});
		}
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
		if (zoom <= 16) {
			map.setOptions({
				zoom: 17,
				center: HanyangUniversity,
			});
		}
		setIsDangerActive((isActive) => {
			toggleMarkers(
				!isActive,
				dangerMarkers.map((marker) => marker.element),
				map,
			);
			return !isActive;
		});
	};

	/** 선택된 마커의 출처 (Marker, List), Type을 비교하여 출발지, 도착지 지정 */
	const selectRoutePoint = (type?: RoutePointType) => {
		if (!selectedMarker || !selectedMarker.property || selectedMarker.type !== Markers.BUILDING) return;

		if (selectedMarker.from === "Marker" && type) {
			switch (type) {
				case RoutePoint.ORIGIN:
					if (selectedMarker.id === destination?.nodeId) setDestination(undefined);
					setOrigin(selectedMarker.property);
					break;
				case RoutePoint.DESTINATION:
					if (selectedMarker.id === origin?.nodeId) setOrigin(undefined);
					setDestination(selectedMarker.property);
					break;
			}
		} else {
			if (!origin) setOrigin(selectedMarker.property);
			else setDestination(selectedMarker.property);
		}

		setSheetOpen(false);
		setSelectedMarker(undefined);
	};

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: SelectedMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;

		if (marker.property && (marker.id === origin?.nodeId || marker.id === destination?.nodeId)) {
			if (isSelect) {
				map.setOptions({
					center: { lat: marker.property.lat, lng: marker.property.lng },
					zoom: 19,
				});
				setSheetOpen(true);
			}

			return;
		}

		if (marker.type === Markers.BUILDING && marker.property) {
			if (isSelect) {
				marker.element.content = createMarkerElement({
					type: Markers.SELECTED_BUILDING,
					title: marker.property.buildingName,
					className: "translate-marker",
				});
				map.setOptions({
					center: { lat: marker.property.lat, lng: marker.property.lng },
					zoom: 19,
				});
				setSheetOpen(true);

				return;
			}

			if (marker.id === origin?.nodeId) {
				marker.element.content = createMarkerElement({
					type: Markers.ORIGIN,
					title: marker.property.buildingName,
					className: "translate-routemarker",
				});
			} else if (marker.id === destination?.nodeId) {
				marker.element.content = createMarkerElement({
					type: Markers.DESTINATION,
					title: destination.buildingName,
					className: "translate-routemarker",
				});
			}

			marker.element.content = createMarkerElement({
				type: Markers.BUILDING,
				title: marker.property.buildingName,
				className: "translate-marker",
			});
		} else {
			if (isSelect) {
				if (marker.type === Markers.DANGER) {
					const key = marker.factors && (marker.factors[0] as DangerIssueType);
					marker.element.content = createMarkerElement({
						type: marker.type,
						title: key && DangerIssue[key],
						hasTopContent: true,
					});
				} else if (marker.type === Markers.CAUTION) {
					const key = marker.factors && (marker.factors[0] as CautionIssueType);
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
		}
	};

	const findBuildingMarker = (id: NodeId): AdvancedMarker | undefined => {
		const matchedMarker = buildingMarkers.find((el) => el.nodeId === id)?.element;

		return matchedMarker;
	};

	/** 초기 렌더링 시, 건물 | 위험 | 주의 마커 생성 */
	useEffect(() => {
		initMap();
		addBuildings();
		addRiskMarker();
	}, [map]);

	/** 선택된 마커가 있는 경우 */
	useEffect(() => {
		changeMarkerStyle(selectedMarker, true);
		return () => {
			changeMarkerStyle(selectedMarker, false);
		};
	}, [selectedMarker]);

	/** 빌딩 리스트에서 넘어온 경우, 일치하는 BuildingMarkerElement를 탐색 */
	useEffect(() => {
		if (buildingMarkers.length === 0 || !selectedBuilding || !selectedBuilding.nodeId) return;

		const matchedMarker = findBuildingMarker(selectedBuilding.nodeId);

		if (matchedMarker)
			setSelectedMarker({
				id: selectedBuilding.nodeId,
				type: Markers.BUILDING,
				element: matchedMarker,
				from: "List",
				property: selectedBuilding,
			});
	}, [selectedBuilding, buildingMarkers]);

	/** 출발지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!origin || !origin.nodeId) return;

		const originMarker = findBuildingMarker(origin.nodeId);
		if (!originMarker) return;

		originMarker.content = createMarkerElement({
			type: Markers.ORIGIN,
			title: origin.buildingName,
			className: "translate-routemarker",
		});

		return () => {
			originMarker.content = createMarkerElement({
				type: Markers.BUILDING,
				title: origin.buildingName,
				className: "translate-marker",
			});
		};
	}, [origin]);

	/** 도착지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!destination || !destination.nodeId) return;

		const destinationMarker = findBuildingMarker(destination.nodeId);
		if (!destinationMarker) return;

		destinationMarker.content = createMarkerElement({
			type: Markers.DESTINATION,
			title: destination.buildingName,
			className: "translate-routemarker",
		});

		return () => {
			destinationMarker.content = createMarkerElement({
				type: Markers.BUILDING,
				title: destination.buildingName,
				className: "translate-marker",
			});
		};
	}, [destination]);

	useEffect(() => {
		if (!map) return;

		const _buildingMarkers = buildingMarkers.map((buildingMarker) => buildingMarker.element);

		if (prevZoom.current >= 17 && zoom <= 16) {
			if (isCautionAcitve) {
				setIsCautionActive(false);
				toggleMarkers(
					false,
					cautionMarkers.map((marker) => marker.element),
					map,
				);
			}
			if (isDangerAcitve) {
				setIsDangerActive(false);
				toggleMarkers(
					false,
					dangerMarkers.map((marker) => marker.element),
					map,
				);
			}

			toggleMarkers(true, universityMarker ? [universityMarker] : [], map);
			toggleMarkers(false, _buildingMarkers, map);
		} else if (prevZoom.current <= 16 && zoom >= 17) {
			toggleMarkers(false, universityMarker ? [universityMarker] : [], map);
			toggleMarkers(true, _buildingMarkers, map);
		}
	}, [map, zoom]);

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto justify-center">
			<TopSheet open={!sheetOpen} />
			<div ref={mapRef} className="w-full h-full" />
			<BottomSheet
				ref={bottomSheetRef}
				blocking={false}
				open={sheetOpen}
				snapPoints={({ minHeight }) => minHeight}
			>
				{selectedMarker &&
					(selectedMarker.from === "Marker" ? (
						/** 선택된 마커가 Marker 클릭에서 온 경우 */
						<MapBottomSheetFromMarker
							building={selectedMarker}
							onClickLeft={() => selectRoutePoint(RoutePoint.ORIGIN)}
							onClickRight={() => selectRoutePoint(RoutePoint.DESTINATION)}
						/>
					) : (
						/** 선택된 마커가 리스트에서 온 경우 */
						<MapBottomSheetFromList
							building={selectedMarker}
							onClick={selectRoutePoint}
							buttonText={mode === RoutePoint.ORIGIN ? "출발지 설정" : "도착지 설정"}
						/>
					))}
			</BottomSheet>
			{origin && destination && origin.nodeId !== destination.nodeId ? (
				/** 출발지랑 도착지가 존재하는 경우 길찾기 버튼 보이기 */
				<div onClick={() => findFastRoute()} className="absolute bottom-6 space-y-2 w-full px-4">
					<Button variant="primary">길찾기</Button>
				</div>
			) : (
				/** 출발지랑 도착지가 존재하지 않거나, 같은 경우 기존 Button UI 보이기 */
				<>
					<div className="absolute right-4 bottom-6 space-y-2">
						<ReportButton onClick={open} />
					</div>
					<div className="absolute right-4 bottom-[90px] space-y-2">
						<CautionToggleButton isActive={isCautionAcitve} onClick={toggleCautionButton} />
						<DangerToggleButton isActive={isDangerAcitve} onClick={toggleDangerButton} />
					</div>
				</>
			)}
			{isOpen && <ReportModal close={close} />}
			<FailModal />
		</div>
	);
}
