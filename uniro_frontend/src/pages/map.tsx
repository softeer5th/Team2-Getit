import { useEffect, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import { buildings } from "../data/mock/hanyangBuildings";
import {
	buildingMarkerContent,
	cautionMarkerContent,
	dangerMarkerContent,
	selectedBuildingMarkerContent,
} from "../components/map/mapMarkers";
import { mockHazardEdges } from "../data/mock/hanyangHazardEdge";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import { Building } from "../data/types/node";
import "react-spring-bottom-sheet/dist/style.css";
import { MapBottomSheetFromList, MapBottomSheetFromMarker } from "../components/map/mapBottomSheet";
import TopSheet from "../components/map/TopSheet";
import { CautionToggleButton, DangerToggleButton } from "../components/map/floatingButtons";
import ReportButton from "../components/map/reportButton";
import useSearchRoute from "../hooks/useSearchRoute";
import useSearchMode from "../hooks/useSearchMode";

type MarkerTypes = "building" | "caution" | "danger";
export type SelectedMarkerTypes = {
	type: MarkerTypes;
	element: google.maps.marker.AdvancedMarkerElement;
	property?: Building;
	from: "Marker" | "List";
};

function createAdvancedMarker(
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	map: google.maps.Map,
	position: google.maps.LatLng,
	content: HTMLElement,
	clickCallback: () => void,
) {
	const newMarker = new AdvancedMarker({
		map: map,
		position: position,
		content: content,
	});

	newMarker.addListener("click", clickCallback);

	return newMarker;
}

export default function MapPage() {
	const { mapRef, map, AdvancedMarker } = useMap();
	const [selectedMarker, setSelectedMarker] = useState<SelectedMarkerTypes>();
	const bottomSheetRef = useRef<BottomSheetRef>(null);
	const [sheetOpen, setSheetOpen] = useState<boolean>(false);

	const [buildingMarkers, setBuildingMarkers] = useState<
		{
			element: google.maps.marker.AdvancedMarkerElement;
			id: string;
		}[]
	>([]);
	const [dangerMarkers, setDangerMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
	const [isDangerAcitve, setIsDangerActive] = useState<boolean>(true);

	const [cautionMarkers, setCautionMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
	const [isCautionAcitve, setIsCautionActive] = useState<boolean>(true);

	const { origin, setOrigin, destination, setDestination, switchBuilding } = useSearchRoute();
	const { mode, setMode, building, setBuilding } = useSearchMode();

	const initMap = () => {
		if (map === null) return;
		map.addListener("click", (e: unknown) => {
			setSheetOpen(false);
			setSelectedMarker((marker) => {
				if (marker) {
					const { type, element } = marker;

					switch (type) {
						case "caution":
							element.content = cautionMarkerContent();
							break;
						case "danger":
							element.content = dangerMarkerContent();
							break;
					}
				}
				return undefined;
			});
		});
	};

	const addBuildings = () => {
		if (AdvancedMarker === null || map === null) return;

		const markersWithId: { id: string; element: google.maps.marker.AdvancedMarkerElement }[] = [];
		for (const building of buildings) {
			const { id, lat, lng, buildingName } = building;

			const buildingMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng(lat, lng),
				buildingMarkerContent({ title: buildingName }),
				() => {
					setSelectedMarker({
						type: "building",
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
				dangerFactors ? dangerMarkerContent() : cautionMarkerContent(),
				() => {
					hazardMarker.content = dangerFactors
						? dangerMarkerContent(dangerFactors)
						: cautionMarkerContent(cautionFactors);
					setSelectedMarker({
						type: dangerFactors ? "danger" : "caution",
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

	const toggleMarkers = (isActive: boolean, markers: google.maps.marker.AdvancedMarkerElement[]) => {
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

	const selectOriginNDestination = (type?: "origin" | "destination") => {
		if (!selectedMarker || !selectedMarker.property || selectedMarker.type !== "building") return;

		if (selectedMarker.from === "Marker" && type) {
			switch (type) {
				case "origin":
					setOrigin(selectedMarker.property);
					break;
				case "destination":
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

	const changeMarkerStyle = (marker: google.maps.marker.AdvancedMarkerElement, isSelect: boolean) => {
		if (!selectedMarker || selectedMarker.type !== "building" || !selectedMarker.property) return;

		if (isSelect) {
			marker.content = selectedBuildingMarkerContent({
				title: selectedMarker.property.buildingName,
			});
			map?.setOptions({
				center: { lat: selectedMarker.property.lat, lng: selectedMarker.property.lng },
				zoom: 19,
			});
			setSheetOpen(true);
		} else
			marker.content = buildingMarkerContent({
				title: selectedMarker.property.buildingName,
			});
	};

	useEffect(() => {
		initMap();
		addBuildings();
		addHazardMarker();
	}, [map]);

	useEffect(() => {
		if (selectedMarker === undefined) return;
		changeMarkerStyle(selectedMarker.element, true);
		return () => {
			changeMarkerStyle(selectedMarker.element, false);
		};
	}, [selectedMarker]);

	useEffect(() => {
		if (buildingMarkers.length === 0 || !building) return;

		const matchedMarker = buildingMarkers.find((el) => el.id === building.id)?.element;

		if (matchedMarker)
			setSelectedMarker({
				type: "building",
				element: matchedMarker,
				from: "List",
				property: building,
			});
	}, [building, buildingMarkers]);

	return (
		<div className="relative flex flex-col h-screen w-full max-w-[450px] mx-auto justify-center">
			<TopSheet open={!sheetOpen} />
			<div ref={mapRef} className="w-full h-full" />
			<div className="absolute right-4 bottom-6 space-y-2">
				<ReportButton />
			</div>
			<div className="absolute right-4 bottom-[90px] space-y-2">
				<CautionToggleButton isActive={isCautionAcitve} onClick={toggleCautionButton} />
				<DangerToggleButton isActive={isDangerAcitve} onClick={toggleDangerButton} />
			</div>
			<BottomSheet
				ref={bottomSheetRef}
				blocking={false}
				open={sheetOpen}
				snapPoints={({ minHeight }) => minHeight}
			>
				{selectedMarker &&
					(selectedMarker.from === "Marker" ? (
						<MapBottomSheetFromMarker
							building={selectedMarker}
							onClickLeft={() => selectOriginNDestination("origin")}
							onClickRight={() => selectOriginNDestination("destination")}
						/>
					) : (
						<MapBottomSheetFromList
							onClick={selectOriginNDestination}
							buttonText={mode === "origin" ? "출발지 설정" : "도착지 설정"}
							building={selectedMarker}
						/>
					))}
			</BottomSheet>
		</div>
	);
}
