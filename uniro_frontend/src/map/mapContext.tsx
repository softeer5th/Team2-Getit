import { createContext, ReactNode, useEffect, useState } from "react";
import loadGoogleMapsLibraries from "./loader/googleMapLoader";
interface MapContextType {
	Map: typeof google.maps.Map | null;
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement | null;
	Polyline: typeof google.maps.Polyline | null;
	Polygon: typeof google.maps.Polygon | null;
}

const MapContext = createContext<MapContextType>({
	Map: null,
	AdvancedMarker: null,
	Polyline: null,
	Polygon: null,
});

export function MapProvider({ children }: { children: ReactNode }) {
	const [mapClasses, setMapClasses] = useState<MapContextType>({
		Map: null,
		AdvancedMarker: null,
		Polyline: null,
		Polygon: null,
	});

	useEffect(() => {
		const loadClasses = async () => {
			const { Map, AdvancedMarkerElement, Polyline, Polygon } = await loadGoogleMapsLibraries();
			setMapClasses({
				Map,
				AdvancedMarker: AdvancedMarkerElement,
				Polyline,
				Polygon,
			});
		};

		loadClasses();
	}, []);

	return <MapContext.Provider value={{ ...mapClasses }}>{children}</MapContext.Provider>;
}

export default MapContext;
