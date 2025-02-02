import { EDGE_LENGTH } from "../../constant/edge";
import { LatLngToLiteral } from "../coordinates/coordinateTransform";
import distance from "../coordinates/distance";

/** 구면 보간 없이 계산한 결과 */
export default function createSubNodes(polyLine: google.maps.Polyline): google.maps.LatLngLiteral[] {
	const paths = polyLine.getPath();
	const [startNode, endNode] = paths.getArray().map((el) => LatLngToLiteral(el));

	const length = distance(startNode, endNode);

	const subEdgesCount = Math.ceil(length / EDGE_LENGTH);

	const interval = {
		lat: (endNode.lat - startNode.lat) / subEdgesCount,
		lng: (endNode.lng - startNode.lng) / subEdgesCount,
	};

	const subNodes = [];

	for (let i = 0; i < subEdgesCount; i++) {
		const subNode: google.maps.LatLngLiteral = {
			lat: startNode.lat + interval.lat * i,
			lng: startNode.lng + interval.lng * i,
		};
		subNodes.push(subNode);
	}

	subNodes.push(endNode);

	return subNodes;
}
