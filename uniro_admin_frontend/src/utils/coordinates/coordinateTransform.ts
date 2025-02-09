export function LatLngToLiteral(coordinate: google.maps.LatLng): google.maps.LatLngLiteral {
	return {
		lat: coordinate.lat(),
		lng: coordinate.lng(),
	};
}
