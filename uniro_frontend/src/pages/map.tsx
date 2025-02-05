import { useEffect, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import { hanyangBuildings } from "../data/mock/hanyangBuildings";
import createMarkerElement from "../components/map/mapMarkers";
import { mockHazardEdges } from "../data/mock/hanyangHazardEdge";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import { Building } from "../data/types/node";
import "react-spring-bottom-sheet/dist/style.css";
import { MapBottomSheetFromList, MapBottomSheetFromMarker } from "../components/map/mapBottomSheet";
import TopSheet from "../components/map/TopSheet";
import { CautionToggleButton, DangerToggleButton } from "../components/map/floatingButtons";
import ReportButton from "../components/map/reportButton";
import useRoutePoint from "../hooks/useRoutePoint";
import useSearchBuilding from "../hooks/useSearchBuilding";
import Button from "../components/customButton";
import { AdvancedMarker, MarkerTypes } from "../data/types/marker";
import { RoutePointType } from "../data/types/route";
import { RoutePoint } from "../constant/enum/routeEnum";
import { Markers } from "../constant/enum/markerEnum";
import createAdvancedMarker, { createUniversityMarker } from "../utils/markers/createAdvanedMarker";
import toggleMarkers from "../utils/markers/toggleMarkers";

import { Link } from "react-router";
import useModal from "../hooks/useModal";
import ReportModal from "../components/map/reportModal";

import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { HanyangUniversity } from "../constant/university";

export type SelectedMarkerTypes = {
	type: MarkerTypes;
	id: string | number;
	element: AdvancedMarker;
	property?: Building;
	factors?: string[];
	from: "Marker" | "List";
};

export default function MapPage() {
	const { mapRef, map, AdvancedMarker } = useMap();
	const [zoom, setZoom] = useState<number>(16);
	const prevZoom = useRef<number>(16);

	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const [sheetOpen, setSheetOpen] = useState<boolean>(false);

	const [buildingMarkers, setBuildingMarkers] = useState<{ element: AdvancedMarker; id: string }[]>([]);
	const [dangerMarkers, setDangerMarkers] = useState<AdvancedMarker[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(false);

	const [cautionMarkers, setCautionMarkers] = useState<AdvancedMarker[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(false);

	const [universityMarker, setUniversityMarker] = useState<AdvancedMarker>();

	const { origin, setOrigin, destination, setDestination } = useRoutePoint();
	const { mode, building: selectedBuilding } = useSearchBuilding();

	const [_, isOpen, open, close] = useModal();

	const { university } = useUniversityInfo();
	useRedirectUndefined<string | undefined>([university]);

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

				return curZoom
			});
		})

		const centerMarker = createUniversityMarker(
			AdvancedMarker,
			map,
			HanyangUniversity,
			university ? university : "",
		)
		setUniversityMarker(centerMarker);
	};

	const addBuildings = () => {
		if (AdvancedMarker === null || map === null) return;

		const markersWithId: { id: string; element: AdvancedMarker }[] = [];
		for (const building of hanyangBuildings) {
			const { id, lat, lng, buildingName } = building;

			const buildingMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng(lat, lng),
				createMarkerElement({ type: Markers.BUILDING, title: buildingName, className: "translate-marker" }),
				() => {
					setSelectedMarker({
						id: id,
						type: Markers.BUILDING,
						element: buildingMarker,
						property: building,
						from: "Marker",
					});
				},
			);

			markersWithId.push({ id: id ? id : "", element: buildingMarker });
		}

		setBuildingMarkers(markersWithId);
	};

	const addHazardMarker = () => {
		if (AdvancedMarker === null || map === null) return;
		for (const edge of mockHazardEdges) {
			const { id, startNode, endNode, dangerFactors, cautionFactors } = edge;
			const hazardMarker = createAdvancedMarker(
				AdvancedMarker,
				null,
				new google.maps.LatLng({
					lat: (startNode.lat + endNode.lat) / 2,
					lng: (startNode.lng + endNode.lng) / 2,
				}),
				createMarkerElement({ type: dangerFactors ? Markers.DANGER : Markers.CAUTION }),
				() => {
					setSelectedMarker((prevMarker) => {
						if (prevMarker && prevMarker.id === id) {
							return undefined;
						}
						return {
							id: id,
							type: dangerFactors ? Markers.DANGER : Markers.CAUTION,
							element: hazardMarker,
							factors: dangerFactors ? dangerFactors : cautionFactors,
							from: "Marker",
						}
					})
				},
			);
			if (dangerFactors) {
				setDangerMarkers((prevMarkers) => [...prevMarkers, hazardMarker]);
			} else {
				setCautionMarkers((prevMarkers) => [...prevMarkers, hazardMarker]);
			}
		}
	};

	const toggleCautionButton = () => {
		if (!map) return;
		setIsCautionActive((isActive) => {
			toggleMarkers(!isActive, cautionMarkers, map);
			return !isActive;
		});
	};
	const toggleDangerButton = () => {
		if (!map) return;
		setIsDangerActive((isActive) => {
			toggleMarkers(!isActive, dangerMarkers, map);
			return !isActive;
		});
	};

	/** 선택된 마커의 출처 (Marker, List), Type을 비교하여 출발지, 도착지 지정 */
	const selectRoutePoint = (type?: RoutePointType) => {
		if (!selectedMarker || !selectedMarker.property || selectedMarker.type !== Markers.BUILDING) return;

		if (selectedMarker.from === "Marker" && type) {
			switch (type) {
				case RoutePoint.ORIGIN:
					if (selectedMarker.id === destination?.id) setDestination(undefined);
					setOrigin(selectedMarker.property);
					break;
				case RoutePoint.DESTINATION:
					if (selectedMarker.id === origin?.id) setOrigin(undefined);
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

		if (marker.property && (marker.id === origin?.id || marker.id === destination?.id)) {
			if (isSelect) {
				map.setOptions({
					center: { lat: marker.property.lat, lng: marker.property.lng },
					zoom: 19,
				})
				setSheetOpen(true);
			}

			return;
		}

		if (marker.type == Markers.BUILDING && marker.property) {
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

			if (marker.id === origin?.id) {
				marker.element.content = createMarkerElement({
					type: Markers.ORIGIN,
					title: marker.property.buildingName,
					className: "translate-routemarker",
				});
			}

			else if (marker.id === destination?.id) {
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
				marker.element.content = createMarkerElement({
					type: marker.type,
					title: marker.factors && marker.factors[0],
					hasTopContent: true,
				});

				return;
			}

			marker.element.content = createMarkerElement({
				type: marker.type,
			});
		}
	};

	const findBuildingMarker = (id: string): AdvancedMarker | undefined => {
		const matchedMarker = buildingMarkers.find((el) => el.id === id)?.element;

		return matchedMarker;
	};

	/** 초기 렌더링 시, 건물 | 위험 | 주의 마커 생성 */
	useEffect(() => {
		initMap();
		addBuildings();
		addHazardMarker();
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
		if (buildingMarkers.length === 0 || !selectedBuilding || !selectedBuilding.id) return;

		const matchedMarker = findBuildingMarker(selectedBuilding.id);

		if (matchedMarker)
			setSelectedMarker({
				id: selectedBuilding.id,
				type: Markers.BUILDING,
				element: matchedMarker,
				from: "List",
				property: selectedBuilding,
			});
	}, [selectedBuilding, buildingMarkers]);

	/** 출발지 결정 시, Marker Content 변경 */
	useEffect(() => {
		if (!origin || !origin.id) return;

		const originMarker = findBuildingMarker(origin.id);
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
		if (!destination || !destination.id) return;

		const destinationMarker = findBuildingMarker(destination.id);
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

		const _buildingMarkers = buildingMarkers.map(buildingMarker => buildingMarker.element);

		if (prevZoom.current >= 17 && zoom <= 16) {
			if (isCautionAcitve) {
				setIsCautionActive(false);
				toggleMarkers(false, cautionMarkers, map);
			}
			if (isDangerAcitve) {
				setIsDangerActive(false);
				toggleMarkers(false, dangerMarkers, map);
			}

			toggleMarkers(true, universityMarker ? [universityMarker] : [], map);
			toggleMarkers(false, _buildingMarkers, map);
		}
		else if ((prevZoom.current <= 16 && zoom >= 17)) {
			toggleMarkers(false, universityMarker ? [universityMarker] : [], map);
			toggleMarkers(true, _buildingMarkers, map);
		}
	}, [map, zoom])

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
			{origin && destination && origin.id !== destination.id ? (
				/** 출발지랑 도착지가 존재하는 경우 길찾기 버튼 보이기 */
				<Link to="/result" className="absolute bottom-6 space-y-2 w-full px-4">
					<Button variant="primary">길찾기</Button>
				</Link>
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
		</div>
	);
}
