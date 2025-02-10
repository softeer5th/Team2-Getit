import { Coord } from "../../data/types/coord";
import { Node } from "../../data/types/node";
import { CoreRoute } from "../../data/types/route";
import centerCoordinate from "../coordinates/centerCoordinate";
import distance from "../coordinates/distance";

export default function findNearestSubEdge(
	spherical: typeof google.maps.geometry.spherical | null,
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
				distance: distance(spherical, point, centerCoordinate(spherical, edge.node1, edge.node2)),
			};
		})
		.sort((a, b) => {
			return a.distance - b.distance;
		});

	const nearestEdge = edgesWithDistance[0].edge;

	const { node1, node2 } = nearestEdge;
	const distance0 = distance(spherical, node1, point);
	const distance1 = distance(spherical, node2, point);
	const nearestPoint = distance0 > distance1 ? node2 : node1;

	return {
		edge: nearestEdge,
		point: nearestPoint,
	};
}
