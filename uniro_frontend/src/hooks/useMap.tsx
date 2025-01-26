import React, { useEffect, useRef, useState } from "react";
import { initializeMap } from "../map/initializer/googleMapInitializer";

const useMap = () => {
	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [overlay, setOverlay] = useState<google.maps.OverlayView | null>(null);
	const [AdvancedMarker, setAdvancedMarker] = useState<typeof google.maps.marker.AdvancedMarkerElement | null>(null);
	const [Polyline, setPolyline] = useState<typeof google.maps.Polyline | null>(null);
	const [mapLoaded, setMapLoaded] = useState<boolean>(false);

	useEffect(() => {
		if (!mapRef.current) return;

		const initMap = async () => {
			try {
				const { map, overlay, AdvancedMarkerElement, Polyline } = await initializeMap(mapRef.current);
				setMap(map);
				setOverlay(overlay);
				setAdvancedMarker(() => AdvancedMarkerElement);
				setPolyline(() => Polyline);
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

	return { mapRef, map, overlay, AdvancedMarker, Polyline, mapLoaded };
};

export default useMap;
