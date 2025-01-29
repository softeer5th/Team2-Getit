import useMap from "../hooks/useMap";

type MapProps = {
	style?: React.CSSProperties;
};
const Map = ({ style }: MapProps) => {
	const { mapRef } = useMap();
	if (!style) {
		style = { height: "100%", width: "100%" };
	}

	return <div id="map" ref={mapRef} style={{ height: "100%", width: "100%" }}></div>;
};

export default Map;
