import { EDGE_LENGTH } from "../../constant/edge";
import { Coord } from "../../data/types/coord";
import { LatLngToLiteral } from "../coordinates/coordinateTransform";
import distance from "../coordinates/distance";

/** 구면 보간 없이 계산한 결과 */
export default function createSubNodes(
	spherical: typeof google.maps.geometry.spherical | null,
	polyLine: google.maps.Polyline,
): Coord[] {
	const paths = polyLine.getPath();
	const [startNode, endNode] = paths.getArray().map((el) => LatLngToLiteral(el));

	const length = distance(spherical, startNode, endNode);
	console.log("구면 보간", length);

	const subEdgesCount = Math.ceil(length / EDGE_LENGTH);

	const subNodes: Coord[] = [startNode];

	if (spherical === null || !spherical) {
		const interval = {
			lat: (endNode.lat - startNode.lat) / subEdgesCount,
			lng: (endNode.lng - startNode.lng) / subEdgesCount,
		};

		for (let i = 1; i < subEdgesCount; i++) {
			const subNode: Coord = {
				lat: startNode.lat + interval.lat * i,
				lng: startNode.lng + interval.lng * i,
			};
			subNodes.push(subNode);
		}

		subNodes.push(endNode);
		return subNodes;
	}

	for (let i = 1; i < subEdgesCount; i++) {
		const fraction = i / subEdgesCount;
		subNodes.push(LatLngToLiteral(spherical.interpolate(startNode, endNode, fraction)));
	}

	subNodes.push(endNode);

	return subNodes;
}
