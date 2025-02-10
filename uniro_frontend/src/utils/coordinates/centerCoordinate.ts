import { Coord } from "../../data/types/coord";
import { LatLngToLiteral } from "./coordinateTransform";

export default function centerCoordinate(
	spherical: typeof google.maps.geometry.spherical | null,
	point1: Coord,
	point2: Coord,
): Coord {
	if (spherical === null) {
		return {
			lat: (point1.lat + point2.lat) / 2,
			lng: (point1.lng + point2.lng) / 2,
		};
	} else {
		return LatLngToLiteral(spherical.interpolate(point1, point2, 0.5));
	}
}
