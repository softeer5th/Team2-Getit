import { useEffect, useRef, useState } from "react";
import { initializeMap } from "../map/initializer/googleMapInitializer";

const useMap = (mapOptions?: google.maps.MapOptions) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [overlay, setOverlay] = useState<google.maps.OverlayView | null>(null);
	const [AdvancedMarker, setAdvancedMarker] = useState<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
	const [Polyline, setPolyline] = useState<typeof google.maps.Polyline | null>(null);
	const [Polygon, setPolylgon] = useState<typeof google.maps.Polygon | null>(null);
	const [mapLoaded, setMapLoaded] = useState<boolean>(false);

	useEffect(() => {
		if (!mapRef.current) return;

		const initMap = async () => {
			try {
				const { map, overlay, AdvancedMarkerElement, Polyline, Polygon } = await initializeMap(
					mapRef.current,
					mapOptions,
				);
				setMap(map);
				setOverlay(overlay);
				setAdvancedMarker(() => AdvancedMarkerElement);
				setPolyline(() => Polyline);
				setPolylgon(() => Polygon);
				setMapLoaded(true);
			} catch (e) {
				alert("Error while initializing map: " + e);
			}
		};

		initMap();

		return () => {
			if (map) {
				map.unbindAll();
			}
		};
	}, []);

	return { mapRef, map, overlay, AdvancedMarker, Polyline, Polygon, mapLoaded };
};

export default useMap;
