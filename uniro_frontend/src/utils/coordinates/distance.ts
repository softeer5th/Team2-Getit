/** 하버사인 공식 */
export default function distance(point1: google.maps.LatLngLiteral, point2: google.maps.LatLngLiteral): number {
	const { lat: lat1, lng: lng1 } = point1;
	const { lat: lat2, lng: lng2 } = point2;

	const R = 6371000;
	const toRad = (angle: number) => (angle * Math.PI) / 180;

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lng2 - lng1);

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}
