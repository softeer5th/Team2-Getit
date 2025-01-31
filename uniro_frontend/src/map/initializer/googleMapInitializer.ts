import { HanyangUniversity } from "../../constant/university";

import loadGoogleMapsLibraries from "../loader/googleMapLoader";

interface MapWithOverlay {
	map: google.maps.Map | null;
	overlay: google.maps.OverlayView | null;
	AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
	Polyline: typeof google.maps.Polyline;
}

export const initializeMap = async (mapElement: HTMLElement | null): Promise<MapWithOverlay> => {
	const { Map, OverlayView, AdvancedMarkerElement, Polyline } = await loadGoogleMapsLibraries();

	// useMap hook에서 error을 catch 하도록 함.
	if (!mapElement) {
		throw new Error("mapElement is null");
	}

	const map = new Map(mapElement, {
		center: HanyangUniversity,
		zoom: 16,
		minZoom: 15,
		maxZoom: 19,
		draggable: true,
		scrollwheel: true,
		disableDoubleClickZoom: false,
		gestureHandling: "auto",
		clickableIcons: false,
		disableDefaultUI: true,
		// restriction: {
		// 	latLngBounds: HanyangUniversityBounds,
		// 	strictBounds: false,
		// },
		mapId: import.meta.env.VITE_REACT_APP_GOOGLE_MAP_ID,
	});

	const overlay = new OverlayView();
	overlay.onAdd = function () {};
	overlay.draw = function () {};
	overlay.onRemove = function () {};
	overlay.setMap(map);

	return { map, overlay, AdvancedMarkerElement, Polyline };
};
