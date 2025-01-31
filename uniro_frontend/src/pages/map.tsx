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
import { RoutePoint } from "../constant/enums";
import { Markers } from "../constant/enums";
import createAdvancedMarker from "../utils/markers/createAdvanedMarker";

export type SelectedMarkerTypes = {
	type: MarkerTypes;
	element: AdvancedMarker;
	property?: Building;
	from: "Marker" | "List";
};

export default function MapPage() {
	const { mapRef, map, AdvancedMarker } = useMap();
	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const [sheetOpen, setSheetOpen] = useState<boolean>(false);

	const [buildingMarkers, setBuildingMarkers] = useState<{ element: AdvancedMarker; id: string }[]>([]);
	const [dangerMarkers, setDangerMarkers] = useState<AdvancedMarker[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(true);

	const [cautionMarkers, setCautionMarkers] = useState<AdvancedMarker[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(true);

	const { origin, setOrigin, destination, setDestination } = useRoutePoint();
	const { mode, building: selectedBuilding } = useSearchBuilding();

	const initMap = () => {
		if (map === null) return;
		map.addListener("click", (e: unknown) => {
			setSheetOpen(false);
			setSelectedMarker((marker) => {
				if (marker) {
					const { type, element } = marker;

					if (type === Markers.BUILDING) return undefined;

					element.content = createMarkerElement({ type, });
				}
				return undefined;
			});
		});
	};

	const addBuildings = () => {
		if (AdvancedMarker === null || map === null) return;

		const markersWithId: { id: string; element: AdvancedMarker }[] = [];
		for (const building of hanyangBuildings) {
			const { id, lat, lng, buildingName } = building;

			const buildingMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng(lat, lng),
				createMarkerElement({ type: Markers.BUILDING, title: buildingName, className: "translate-marker" }),
				() => {
					setSelectedMarker({
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
				map,
				new google.maps.LatLng({
					lat: (startNode.lat + endNode.lat) / 2,
					lng: (startNode.lng + endNode.lng) / 2,
				}),
				createMarkerElement({ type: dangerFactors ? Markers.DANGER : Markers.CAUTION }),
				() => {
					hazardMarker.content = createMarkerElement({
						type: dangerFactors ? Markers.DANGER : Markers.CAUTION,
						title: dangerFactors ? dangerFactors[0] : cautionFactors && cautionFactors[0],
						hasTopContent: true,
					});
					setSelectedMarker({
						type: dangerFactors ? Markers.DANGER : Markers.CAUTION,
						element: hazardMarker,
						from: "Marker",
					});
				},
			);
			if (dangerFactors) {
				setDangerMarkers((prevMarkers) => [...prevMarkers, hazardMarker]);
			} else {
				setCautionMarkers((prevMarkers) => [...prevMarkers, hazardMarker]);
			}
		}
	};

	/** Marker 보이기 안보이기 토글 */
	const toggleMarkers = (isActive: boolean, markers: AdvancedMarker[]) => {
		if (isActive) {
			for (const marker of markers) {
				marker.map = map;
			}
		} else {
			for (const marker of markers) {
				marker.map = null;
			}
		}
	};

	const toggleCautionButton = () => {
		setIsCautionActive((isActive) => {
			toggleMarkers(!isActive, cautionMarkers);
			return !isActive;
		});
	};
	const toggleDangerButton = () => {
		setIsDangerActive((isActive) => {
			toggleMarkers(!isActive, dangerMarkers);
			return !isActive;
		});
	};

	/** 선택된 마커의 출처 (Marker, List), Type을 비교하여 출발지, 도착지 지정 */
	const selectRoutePoint = (type?: RoutePointType) => {
		if (!selectedMarker || !selectedMarker.property || selectedMarker.type !== Markers.BUILDING) return;

		if (selectedMarker.from === "Marker" && type) {
			switch (type) {
				case RoutePoint.ORIGIN:
					setOrigin(selectedMarker.property);
					break;
				case RoutePoint.DESTINATION:
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
	const changeMarkerStyle = (marker: AdvancedMarker, isSelect: boolean) => {
		if (!map || !selectedMarker || selectedMarker.type !== Markers.BUILDING || !selectedMarker.property) return;

		if (isSelect) {
			marker.content = createMarkerElement({
				type: Markers.SELECTED_BUILDING,
				title: selectedMarker.property.buildingName,
				className: "translate-marker",
			});
			map.setOptions({
				center: { lat: selectedMarker.property.lat, lng: selectedMarker.property.lng },
				zoom: 19,
			});
			setSheetOpen(true);

			return;
		}
		marker.content = createMarkerElement({
			type: Markers.BUILDING,
			title: selectedMarker.property.buildingName,
			className: "translate-marker",
		});
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
		if (selectedMarker === undefined) return;
		changeMarkerStyle(selectedMarker.element, true);
		return () => {
			changeMarkerStyle(selectedMarker.element, false);
		};
	}, [selectedMarker]);

	/** 빌딩 리스트에서 넘어온 경우, 일치하는 BuildingMarkerElement를 탐색 */
	useEffect(() => {
		if (buildingMarkers.length === 0 || !selectedBuilding || !selectedBuilding.id) return;

		const matchedMarker = findBuildingMarker(selectedBuilding.id);

		if (matchedMarker)
			setSelectedMarker({
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
				className: "translate-routemarker",
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
				className: "translate-routemarker",
			});
		};
	}, [destination]);

	return (
		<div className="relative flex flex-col h-screen w-full max-w-[450px] mx-auto justify-center">
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
				<div className="absolute bottom-6 space-y-2 w-full px-4">
					<Button variant="primary">길찾기</Button>
				</div>
			) : (
				/** 출발지랑 도착지가 존재하지 않거나, 같은 경우 기존 Button UI 보이기 */
				<>
					<div className="absolute right-4 bottom-6 space-y-2">
						<ReportButton />
					</div>
					<div className="absolute right-4 bottom-[90px] space-y-2">
						<CautionToggleButton isActive={isCautionAcitve} onClick={toggleCautionButton} />
						<DangerToggleButton isActive={isDangerAcitve} onClick={toggleDangerButton} />
					</div>
				</>
			)}
		</div>
	);
}
