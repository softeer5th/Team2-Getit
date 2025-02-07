import { Coord } from "../../data/types/coord";

export default function centerCoordinate(point1: Coord, point2: Coord): Coord {
	return {
		lat: (point1.lat + point2.lat) / 2,
		lng: (point1.lng + point2.lng) / 2,
	};
}
