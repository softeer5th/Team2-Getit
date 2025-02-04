import { HanyangUniversity } from "../../constant/university";

import loadGoogleMapsLibraries from "../loader/googleMapLoader";

interface MapWithOverlay {
	map: google.maps.Map | null;
	overlay: google.maps.OverlayView | null;
	AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
	Polyline: typeof google.maps.Polyline;
}

export const initializeMap = async (
	mapElement: HTMLElement | null,
	mapOptions?: google.maps.MapOptions,
): Promise<MapWithOverlay> => {
	const { Map, OverlayView, AdvancedMarkerElement, Polyline } = await loadGoogleMapsLibraries();

	if (!mapElement) {
		throw new Error("Map Element is not provided");
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
		...mapOptions,
	});

	const overlay = new OverlayView();
	overlay.onAdd = function () {};
	overlay.draw = function () {};
	overlay.onRemove = function () {};
	overlay.setMap(map);

	return { map, overlay, AdvancedMarkerElement, Polyline };
};
