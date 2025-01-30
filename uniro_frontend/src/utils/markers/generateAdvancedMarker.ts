import startIcon from "../../assets/marker/startIcon.svg?raw";
import arriveMarker from "../../assets/marker/arriveMarker.svg?raw";
import subMarker from "../../assets/marker/subMarker.svg?raw";
import cautionMarker from "../../assets/marker/cautionMarker.svg?raw";

export const generateAdvancedMarker = (
	map: google.maps.Map,
	AdvancedMarker: typeof google.maps.marker.AdvancedMarkerElement,
	type: "start" | "sub" | "end" | "caution",
	position: { lat: number; lng: number },
) => {
	switch (type) {
		case "start": {
			const startSvgElement = new DOMParser().parseFromString(startIcon, "image/svg+xml").documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: startSvgElement,
				title: "출발지",
			});
			break;
		}
		case "end": {
			const endSvgElement = new DOMParser().parseFromString(arriveMarker, "image/svg+xml").documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: endSvgElement,
				title: "도착지",
			});
			break;
		}
		case "caution": {
			const cautionSvgElement = new DOMParser().parseFromString(cautionMarker, "image/svg+xml").documentElement;
			new AdvancedMarker({
				position: position,
				map,
				content: cautionSvgElement,
				title: "주의사항",
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
