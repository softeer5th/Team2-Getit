import { Coord } from "../../types/coord";
import { interpolate } from "../interpolate";

export default function centerCoordinate(point1: Coord, point2: Coord): Coord {
	return interpolate(point1, point2, 0.5);
}
