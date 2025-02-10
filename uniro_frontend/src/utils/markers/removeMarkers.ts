import { AdvancedMarker } from "../../data/types/marker";

export default function removeMarkers(markers: AdvancedMarker[]) {
	markers.forEach((marker) => (marker.map = null));
}
