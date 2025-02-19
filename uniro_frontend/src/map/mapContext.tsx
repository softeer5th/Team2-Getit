import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import loadGoogleMapsLibraries from "./loader/googleMapLoader";
import { ClickEvent } from "../data/types/event";
interface MapContextType {
	Map: typeof google.maps.Map | null;
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement | null;
	Polyline: typeof google.maps.Polyline | null;
	Polygon: typeof google.maps.Polygon | null;
}

interface MapContextReturn {
	Map: typeof google.maps.Map | null;
	createPolyline: (
		opts?: google.maps.PolylineOptions,
		onClick?: (e: ClickEvent) => void,
	) => google.maps.Polyline | undefined;
	createAdvancedMarker: (
		opts?: google.maps.marker.AdvancedMarkerElementOptions,
		onClick?: (e: ClickEvent) => void,
	) => google.maps.marker.AdvancedMarkerElement | undefined;
	createPolygon: (
		opts?: google.maps.PolygonOptions,
		onClick?: (e: ClickEvent) => void,
	) => google.maps.Polygon | undefined;
}

const MapContext = createContext<MapContextReturn>({
	Map: null,
	createPolyline: () => undefined,
	createAdvancedMarker: () => undefined,
	createPolygon: () => undefined,
});

export function MapProvider({ children }: { children: ReactNode }) {
	const [mapClasses, setMapClasses] = useState<MapContextType>({
		Map: null,
		AdvancedMarker: null,
		Polyline: null,
		Polygon: null,
	});

	const createAdvancedMarker = useCallback(
		(opts?: google.maps.marker.AdvancedMarkerElementOptions, onClick?: (e: ClickEvent) => void) => {
			if (!mapClasses.AdvancedMarker) return undefined;

			const object = new mapClasses.AdvancedMarker(opts);
			if (onClick) object.addListener("click", onClick);
			return object;
		},
		[mapClasses.AdvancedMarker],
	);

	const createPolyline = useCallback(
		(opts?: google.maps.PolylineOptions, onClick?: (e: ClickEvent) => void) => {
			if (!mapClasses.Polyline) return undefined;

			const object = new mapClasses.Polyline(opts);
			if (onClick) object.addListener("click", onClick);
			return object;
		},
		[mapClasses.Polyline],
	);

	const createPolygon = useCallback(
		(opts?: google.maps.PolygonOptions, onClick?: (e: ClickEvent) => void) => {
			if (!mapClasses.Polygon) return undefined;

			const object = new mapClasses.Polygon(opts);
			if (onClick) object.addListener("click", onClick);
			return object;
		},
		[mapClasses.Polygon],
	);

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

	return (
		<MapContext.Provider value={{ Map: mapClasses.Map, createPolyline, createAdvancedMarker, createPolygon }}>
			{children}
		</MapContext.Provider>
	);
}

export default MapContext;
