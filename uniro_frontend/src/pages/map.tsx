import { useEffect, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import createMarkerElement from "../components/map/mapMarkers";
import { Building, NodeId } from "../data/types/node";
import MapBottomSheet from "../components/map/mapBottomSheet";
import { MapTopBuildingSheet, MapTopRouteSheet } from "../components/map/TopSheet";
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
import { Coord } from "../data/types/coord";
import AnimatedContainer from "../container/animatedContainer";


export type SelectedMarkerTypes = {
	type: MarkerTypes;
	id: NodeId | RouteId;
	element: AdvancedMarker;
	property?: Building;
	factors?: DangerIssueType[] | CautionIssueType[];
	from: "Marker" | "List";
};

const BOTTOM_SHEET_HEIGHT = 377;

export default function MapPage() {
	const { mapRef, map, AdvancedMarker } = useMap({ zoom: 16 });
	const [zoom, setZoom] = useState<number>(16);
	const prevZoom = useRef<number>(16);

	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const buildingBoundary = useRef<google.maps.LatLngBounds | null>(null);
	const [buildingMarkers, setBuildingMarkers] = useState<{ element: AdvancedMarker; nodeId: NodeId }[]>([]);

	const [dangerMarkers, setDangerMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(false);

	const [cautionMarkers, setCautionMarkers] = useState<{ element: AdvancedMarker; routeId: RouteId }[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(false);

	const [universityMarker, setUniversityMarker] = useState<AdvancedMarker>();

	const { origin, setOrigin, destination, setDestination } = useRoutePoint();
	const { building: selectedBuilding, setBuilding, searchMode } = useSearchBuilding();

	const [_, isOpen, open, close] = useModal();

	const { university } = useUniversityInfo();
	useRedirectUndefined<University | undefined>([university]);

	const navigate = useNavigate();
	if (!university) return;

	const [FailModal, { status, data, refetch: findFastRoute }] = useQueryError(
		{
			queryKey: ["fastRoute", university.id, origin?.nodeId, destination?.nodeId],
			queryFn: () =>
				getNavigationResult(
					university.id,
					origin ? origin?.nodeId : -1,
					destination ? destination?.nodeId : -1,
				),
			enabled: false,
			retry: 0,
		},
		undefined,
		() => {
			navigate("/result");
		},
		{
			fallback: {
				400: {
					mainTitle: "잘못된 요청입니다.",
					subTitle: ["새로고침 후 다시 시도 부탁드립니다."],
				},
				404: {
					mainTitle: "해당 경로를 찾을 수 없습니다.",
					subTitle: ["해당 건물이 길이랑 연결되지 않았습니다."],
				},
				422: {
					mainTitle: "해당 경로를 찾을 수 없습니다.",
					subTitle: ["위험 요소 버튼을 클릭하여,", "통행할 수 없는 원인을 파악하실 수 있습니다."],
				},
			},
		},
	);

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

	const moveToBound = (coord: Coord) => {
		buildingBoundary.current = new google.maps.LatLngBounds();
		buildingBoundary.current.extend(
			coord
		);
		// 라이브러리를 다양한 화면을 관찰해보았을 때, h-가 377인것을 확인했습니다.
		map?.fitBounds(buildingBoundary.current, {
			top: 0,
			right: 0,
			bottom: BOTTOM_SHEET_HEIGHT,
			left: 0,
		});
	};

	const exitBound = () => {
		buildingBoundary.current = null;
	};

	const initMap = () => {
		if (map === null || !AdvancedMarker) return;
		map.addListener("click", (e: unknown) => {
			exitBound();
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
				(nodeId === origin?.nodeId || nodeId === destination?.nodeId) ? map : null,
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

		exitBound();
		setSelectedMarker(undefined);
	};

	/** isSelect(Marker 선택 시) Marker Content 변경, 지도 이동, BottomSheet 열기 */
	const changeMarkerStyle = (marker: SelectedMarkerTypes | undefined, isSelect: boolean) => {
		if (!map || !marker) return;

		if (marker.type === Markers.BUILDING && marker.property) {
			if (marker.id === origin?.nodeId) {
				marker.element.content = createMarkerElement({
					type: Markers.ORIGIN,
					title: marker.property.buildingName,
					className: "translate-pinmarker",
				});
				return;
			}

			if (marker.id === destination?.nodeId) {
				marker.element.content = createMarkerElement({
					type: Markers.DESTINATION,
					title: destination.buildingName,
					className: "translate-pinmarker",
				});
				return;
			}


			if (isSelect) {
				marker.element.content = createMarkerElement({
					type: Markers.SELECTED_BUILDING,
					title: marker.property.buildingName,
					className: "translate-pinmarker",
				});

				return;
			}

			marker.element.content = createMarkerElement({
				type: Markers.BUILDING,
				title: marker.property.buildingName,
				className: "translate-marker",
			});
		} else {
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

		if (!selectedMarker) {
			const matchedMarker = findBuildingMarker(selectedBuilding.nodeId);

			if (!matchedMarker) return;
			if (searchMode === "BUILDING") {

				setSelectedMarker({
					id: selectedBuilding.nodeId,
					type: Markers.BUILDING,
					element: matchedMarker,
					from: "List",
					property: selectedBuilding,
				});
				return
			}
			if (searchMode === "ORIGIN") {
				setOrigin(selectedBuilding);
				moveToBound(selectedBuilding);
				return;
			}
			if (searchMode === "DESTINATION") {
				setDestination(selectedBuilding);
				moveToBound(selectedBuilding);
			}
		}
	}, [selectedBuilding, buildingMarkers]);

	/** 출발지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!origin || !origin.nodeId) return;

		const originMarker = findBuildingMarker(origin.nodeId);
		if (!originMarker) return;

		originMarker.map = map;

		originMarker.content = createMarkerElement({
			type: Markers.ORIGIN,
			title: origin.buildingName,
			className: "translate-pinmarker",
		});

		return () => {
			const curZoom = map?.getZoom() as number;
			originMarker.content = createMarkerElement({
				type: Markers.BUILDING,
				title: origin.buildingName,
				className: "translate-marker",
			});
			if (curZoom <= 16) originMarker.map = null;
		};
	}, [origin, buildingMarkers]);

	/** 도착지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!destination || !destination.nodeId) return;

		const destinationMarker = findBuildingMarker(destination.nodeId);
		if (!destinationMarker) return;

		destinationMarker.map = map;

		destinationMarker.content = createMarkerElement({
			type: Markers.DESTINATION,
			title: destination.buildingName,
			className: "translate-pinmarker",
		});

		return () => {
			const curZoom = map?.getZoom() as number;

			destinationMarker.content = createMarkerElement({
				type: Markers.BUILDING,
				title: destination.buildingName,
				className: "translate-marker",
			});
			if (curZoom <= 16) destinationMarker.map = null;
		};
	}, [destination, buildingMarkers]);

	/** 출발 도착 설정시, 출발 도착지가 한 눈에 보이도록 지도 조정 */
	useEffect(() => {
		if (origin && destination) {
			const newBound = new google.maps.LatLngBounds();
			newBound.extend(origin);
			newBound.extend(destination)
			map?.fitBounds(newBound)
		}

	}, [origin, destination]);

	useEffect(() => {
		if (selectedMarker && selectedMarker.type === Markers.BUILDING && selectedMarker.property) {
			moveToBound({ lat: selectedMarker.property.lat, lng: selectedMarker.property.lng });
			setBuilding(selectedMarker.property as Building);
		}

		return () => {
			setBuilding(undefined)
		}
	}, [selectedMarker]);

	useEffect(() => {
		if (!map) return;

		if (prevZoom.current >= 17 && zoom <= 16) {
			if (isCautionAcitve) {
				toggleMarkers(
					false,
					cautionMarkers.map((marker) => marker.element),
					map,
				);
			}
			if (isDangerAcitve) {
				toggleMarkers(
					false,
					dangerMarkers.map((marker) => marker.element),
					map,
				);
			}

			toggleMarkers(true, universityMarker ? [universityMarker] : [], map);
			toggleMarkers(false, buildingMarkers.filter(el => el.nodeId !== origin?.nodeId && el.nodeId !== destination?.nodeId).map(el => el.element), map);
		} else if (prevZoom.current <= 16 && zoom >= 17) {
			if (isCautionAcitve) {
				toggleMarkers(
					true,
					cautionMarkers.map((marker) => marker.element),
					map,
				);
			}
			if (isDangerAcitve) {
				toggleMarkers(
					true,
					dangerMarkers.map((marker) => marker.element),
					map,
				);
			}

			toggleMarkers(false, universityMarker ? [universityMarker] : [], map);
			toggleMarkers(true, buildingMarkers.map(el => el.element), map);
		}
	}, [map, zoom]);

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto justify-center">
			<MapTopBuildingSheet isVisible={(selectedMarker?.type === Markers.BUILDING ? false : true) && searchMode === "BUILDING"} />
			<MapTopRouteSheet isVisible={(selectedMarker?.type === Markers.BUILDING ? false : true) && searchMode != "BUILDING"} />
			<div ref={mapRef} className="w-full h-full" />
			<MapBottomSheet
				selectRoutePoint={selectRoutePoint}
				selectedMarker={selectedMarker}
				isVisible={selectedMarker?.type === Markers.BUILDING ? true : false}
			/>
			{/* 출발지랑 도착지가 존재하는 경우 길찾기 버튼 보이기 */}
			<AnimatedContainer
				isVisible={origin !== undefined && destination !== undefined && origin.nodeId !== destination.nodeId}
				positionDelta={200}
				transition={{
					duration: 0.3,
					type: 'spring',
					damping: 20,
				}}
				className=""
			>
				<div onClick={() => findFastRoute()} className="absolute bottom-6 space-y-2 w-full px-4">
					<Button variant="primary">길찾기</Button>
				</div>
			</AnimatedContainer>

			{/* 출발지랑 도착지가 존재하지 않거나, 같은 경우 기존 Button UI 보이기 */}
			<AnimatedContainer
				isVisible={!(origin !== undefined && destination !== undefined && origin.nodeId !== destination.nodeId)}
				positionDelta={200}
				transition={{
					duration: 0.3,
					type: 'spring',
					damping: 20,
				}}
				className=""
			>
				<div className="absolute right-4 bottom-6 space-y-2">
					<ReportButton onClick={open} />
				</div>
				<div className="absolute right-4 bottom-[90px] space-y-2">
					<CautionToggleButton isActive={isCautionAcitve} onClick={toggleCautionButton} />
					<DangerToggleButton isActive={isDangerAcitve} onClick={toggleDangerButton} />
				</div>
			</AnimatedContainer>

			{isOpen && <ReportModal close={close} />}
			<FailModal />
		</div>
	);
}