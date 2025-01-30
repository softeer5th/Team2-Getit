import { useEffect, useRef, useState } from "react";
import useMap from "../hooks/useMap";
import { buildings } from "../data/mock/hanyangBuildings";
import { buildingMarkerContent, cautionMarkerContent, dangerMarkerContent } from "../components/map/mapMarkers";
import { mockHazardEdges } from "../data/mock/hanyangHazardEdge";
import { BottomSheet, BottomSheetRef } from "react-spring-bottom-sheet";
import { Building } from "../data/types/node";
import "react-spring-bottom-sheet/dist/style.css";
import MapBottomSheet from "../components/map/mapBottomSheet";
import TopSheet from "../components/map/TopSheet";

type MarkerTypes = "building" | "caution" | "danger";
export type SelectedMarkerTypes = {
	type: MarkerTypes;
	element: google.maps.marker.AdvancedMarkerElement;
	property?: Building;
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

	const initMap = () => {
		if (map === null) return;
		map.addListener("click", (e: unknown) => {
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
						case "building":
							setSheetOpen(false);
							break;
					}
				}
				return undefined;
			});
		});
	};

	const addBuildings = () => {
		if (AdvancedMarker === null || map === null) return;
		for (const building of buildings) {
			const { id, lat, lng, buildingName } = building;

			const buildingMarker = createAdvancedMarker(
				AdvancedMarker,
				map,
				new google.maps.LatLng(lat, lng),
				buildingMarkerContent({ title: buildingName }),
				() => {
					setSheetOpen(true);
					map?.setOptions({
						center: { lat, lng },
						zoom: 19,
					});
					setSelectedMarker({ type: "building", element: buildingMarker, property: building });
				},
			);
		}
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
					setSelectedMarker({ type: dangerFactors ? "danger" : "caution", element: hazardMarker });
				},
			);
		}
	};

	useEffect(() => {
		initMap();
		addBuildings();
		addHazardMarker();
	}, [map]);

	return (
		<div className="relative flex flex-col h-screen w-full max-w-[450px] mx-auto justify-center">
			{!sheetOpen && <TopSheet />}
			<div ref={mapRef} className="w-full h-full" />
			<BottomSheet
				ref={bottomSheetRef}
				blocking={false}
				open={sheetOpen}
				snapPoints={({ minHeight }) => minHeight}
			>
				{selectedMarker && (
					<MapBottomSheet onClick={() => {}} buttonText="출발지 설정" building={selectedMarker} />
				)}
			</BottomSheet>
		</div>
	);
}
