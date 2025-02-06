import { Markers } from "../../constant/enum/markerEnum";

export type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;

export type MarkerTypesWithElement = {
	type: MarkerTypes;
	element: AdvancedMarker;
};
