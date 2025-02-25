import { Coord } from "../types/coord";

function toRad(deg: number) {
	return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
	return (rad * 180) / Math.PI;
}

export function interpolate(point1: Coord, point2: Coord, fraction: number): Coord {
	const lat1 = toRad(point1.lat);
	const lng1 = toRad(point1.lng);

	const lat2 = toRad(point2.lat);
	const lng2 = toRad(point2.lng);

	const angle = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1));

	const sinAngle = Math.sin(angle);

	const A = Math.sin((1 - fraction) * angle) / sinAngle;
	const B = Math.sin(fraction * angle) / sinAngle;

	const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
	const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
	const z = A * Math.sin(lat1) + B * Math.sin(lat2);

	const interpolatedLat = Math.atan2(z, Math.sqrt(x * x + y * y));
	const interpolatedLng = Math.atan2(y, x);

	return {
		lat: toDeg(interpolatedLat),
		lng: toDeg(interpolatedLng),
	};
}
