import { Loader } from "@googlemaps/js-api-loader";

const GoogleMapsLoader = new Loader({
	apiKey: import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY,
	version: "weekly",
	libraries: ["maps", "marker"],
});

const loadGoogleMapsLibraries = async () => {
	const { Map, Polyline, Polygon } = await GoogleMapsLoader.importLibrary("maps");
	const { AdvancedMarkerElement } = await GoogleMapsLoader.importLibrary("marker");

	return { Map, AdvancedMarkerElement, Polyline, Polygon };
};

export default loadGoogleMapsLibraries;
