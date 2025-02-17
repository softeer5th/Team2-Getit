import { Markers } from "../../constant/enum/markerEnum";
import { MarkerTypes } from "./enum";

export type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;

export type MarkerTypesWithElement = {
	type: MarkerTypes;
	element: AdvancedMarker;
};
