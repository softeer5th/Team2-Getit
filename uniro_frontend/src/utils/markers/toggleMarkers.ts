import { AdvancedMarker } from "../../data/types/marker";

/** Marker 보이기 안보이기 토글 */
export default function toggleMarkers(isActive: boolean, markers: AdvancedMarker[], map: google.maps.Map) {
	if (isActive) {
		for (const marker of markers) {
			marker.map = map;
		}
	} else {
		for (const marker of markers) {
			marker.map = null;
		}
	}
}
