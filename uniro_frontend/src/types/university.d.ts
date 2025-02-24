import { Coord } from "./coord";

export type University = {
	name: string;
	imageUrl: string;
	id: number;
	centerPoint: Coord;
	leftTopPoint: Coord;
	rightBottomPoint: Coord;
	areaPolygon: Coord[];
};
