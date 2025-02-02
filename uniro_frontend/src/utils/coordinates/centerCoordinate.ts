export default function centerCoordinate(
	point1: google.maps.LatLngLiteral,
	point2: google.maps.LatLngLiteral,
): google.maps.LatLngLiteral {
	return {
		lat: (point1.lat + point2.lat) / 2,
		lng: (point1.lng + point2.lng) / 2,
	};
}
