
import useMap from "../hooks/useMap";

export default function ReportRoutePage() {
	const { map, mapRef, AdvancedMarker, Polyline } = useMap({ zoom: 18, minZoom: 17 });
	
	return (
		<div className="relative w-full h-dvh">
			<div ref={mapRef} className="w-full h-full" />
		</div>
	);
}
