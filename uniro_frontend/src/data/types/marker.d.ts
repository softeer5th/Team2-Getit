import { Markers } from "../../constant/enums";

export type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;

export type MarkerTypes =
	| Markers.BUILDING
	| Markers.CAUTION
	| Markers.DANGER
	| Markers.DESTINATION
	| Markers.ORIGIN
	| Markers.NUMBERED_WAYPOINT
	| Markers.WAYPOINT
	| Markers.SELECTED_BUILDING;
