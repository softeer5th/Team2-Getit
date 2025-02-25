import { Coord } from "../../types/coord";
import { Node } from "../../types/node";
import { CoreRoute } from "../../types/route";
import centerCoordinate from "../coordinates/centerCoordinate";
import distance from "../coordinates/distance";

export default function findNearestSubEdge(
	edges: CoreRoute[],
	point: Coord,
): {
	edge: CoreRoute;
	point: Node;
} {
	const edgesWithDistance = edges
		.map((edge) => {
			return {
				edge,
				distance: distance(point, centerCoordinate(edge.node1, edge.node2)),
			};
		})
		.sort((a, b) => {
			return a.distance - b.distance;
		});

	const nearestEdge = edgesWithDistance[0].edge;

	const { node1, node2 } = nearestEdge;
	const distance0 = distance(node1, point);
	const distance1 = distance(node2, point);
	const nearestPoint = distance0 > distance1 ? node2 : node1;

	return {
		edge: nearestEdge,
		point: nearestPoint,
	};
}
