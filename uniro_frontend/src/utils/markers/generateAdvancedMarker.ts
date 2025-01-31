import originIcon from "../../assets/marker/startIcon.svg?raw";
import arriveMarker from "../../assets/marker/arriveMarker.svg?raw";
import subMarker from "../../assets/marker/subMarker.svg?raw";
import cautionMarker from "../../assets/marker/cautionMarker.svg?raw";

export const generateAdvancedMarker = (
	map: google.maps.Map,
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	type: "origin" | "sub" | "destination" | "caution",
	position: { lat: number; lng: number },
) => {
	switch (type) {
		case "origin": {
			const originSvgElement = new DOMParser().parseFromString(originIcon, "image/svg+xml").documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: originSvgElement,
			});
			break;
		}
		case "destination": {
			const destinationSvgElement = new DOMParser().parseFromString(
				arriveMarker,
				"image/svg+xml",
			).documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: destinationSvgElement,
			});
			break;
		}
		case "caution": {
			const cautionSvgElement = new DOMParser().parseFromString(cautionMarker, "image/svg+xml").documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: cautionSvgElement,
			});
			break;
		}
		default: {
			const subMarkerElement = new DOMParser().parseFromString(subMarker, "image/svg+xml").documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: subMarkerElement,
			});
			break;
		}
	}
};
