import useMap from "../hooks/useMap";

const Map = () => {
	const { mapRef } = useMap();

	return <div id="map" ref={mapRef} style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
