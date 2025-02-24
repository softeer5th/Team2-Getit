import { Coord } from "../../types/coord";

/** 하버사인 공식 */
export default function distance(point1: Coord, point2: Coord): number {
	const R = 6378137;
	const { lat: lat_a, lng: lng_a } = point1;
	const { lat: lat_b, lng: lng_b } = point2;

	const rad_lat_a = toRad(lat_a);
	const rad_lng_a = toRad(lng_a);
	const rad_lat_b = toRad(lat_b);
	const rad_lng_b = toRad(lng_b);

	return (
		R *
		2 *
		Math.asin(
			Math.sqrt(
				Math.pow(Math.sin((rad_lat_a - rad_lat_b) / 2), 2) +
					Math.cos(rad_lat_a) * Math.cos(rad_lat_b) * Math.pow(Math.sin((rad_lng_a - rad_lng_b) / 2), 2),
			),
		)
	);
}

const toRad = (angle: number) => (angle * Math.PI) / 180;
