import { AdvancedMarker } from "../../types/marker";
import removeMarkers from "./removeMarkers";

/** Marker 보이기 안보이기 토글 */
export default function toggleMarkers(isActive: boolean, markers: AdvancedMarker[], map: google.maps.Map) {
	if (isActive) {
		markers.forEach((marker) => (marker.map = map));
	} else {
		removeMarkers(markers);
	}
}
