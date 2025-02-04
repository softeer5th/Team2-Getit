import { initializeMap } from "./initializer/googleMapInitializer";

export interface MapResource {
	map: google.maps.Map | null;
	AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | null;
	Polyline: typeof google.maps.Polyline | null;
}

const dummyResource = {
	read() {
		return {
			map: null,
			AdvancedMarkerElement: null,
			Polyline: null,
		} as MapResource;
	},
};

export function createMapResource(
	mapElement: HTMLDivElement | null,
	mapOptions?: google.maps.MapOptions,
): { read(): MapResource } {
	if (!mapElement) {
		return dummyResource;
	}

	let status = "pending";
	let result: MapResource;
	let suspender = initializeMap(mapElement, mapOptions)
		.then((res) => {
			status = "success";
			result = res;
		})
		.catch((e) => {
			status = "error";
			result = e;
		});

	return {
		read() {
			if (status === "error") {
				throw result;
			} else if (status === "pending") {
				throw suspender;
			} else {
				return result;
			}
		},
	};
}
