import { EDGE_LENGTH } from "../../constant/edge";
import { Coord } from "../../types/coord";
import { LatLngToLiteral } from "../coordinates/coordinateTransform";
import distance from "../coordinates/distance";
import { interpolate } from "../interpolate";

/** 구면 보간 없이 계산한 결과 */
export default function createSubNodes(polyLine: google.maps.Polyline): Coord[] {
	const paths = polyLine.getPath();
	const [startNode, endNode] = paths.getArray().map((el) => LatLngToLiteral(el));

	const length = distance(startNode, endNode);

	const subEdgesCount = Math.ceil(length / EDGE_LENGTH);

	const subNodes: Coord[] = [startNode];

	for (let i = 1; i < subEdgesCount; i++) {
		const fraction = i / subEdgesCount;
		subNodes.push(interpolate(startNode, endNode, fraction));
	}

	subNodes.push(endNode);

	return subNodes;
}
