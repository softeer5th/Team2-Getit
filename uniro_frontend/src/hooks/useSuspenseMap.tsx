import { useCallback, useEffect, useState } from "react";
import { createMapResource } from "../map/createMapResource";

interface MapResource {
	map: google.maps.Map | null;
	AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | null;
	Polyline: typeof google.maps.Polyline | null;
}

export function useSuspenseMap(mapOptions?: google.maps.MapOptions) {
	const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null);

	const [resource, setResource] = useState<{ read(): MapResource }>(() => createMapResource(null, mapOptions));

	const mapRef = useCallback((node: HTMLDivElement | null) => {
		setMapElement(node);
	}, []);

	useEffect(() => {
		setResource(createMapResource(mapElement, mapOptions));
	}, [mapElement, mapOptions]);

	const { map, AdvancedMarkerElement, Polyline } = resource.read();

	return {
		mapRef,
		map,
		AdvancedMarker: AdvancedMarkerElement,
		Polyline,
	};
}

export default useSuspenseMap;
