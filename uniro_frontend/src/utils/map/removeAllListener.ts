import { AdvancedMarker } from "../../data/types/marker";

export default function removeAllListener(instance: AdvancedMarker | google.maps.Polyline | google.maps.Polygon) {
	google.maps.event.clearInstanceListeners(instance);
}
