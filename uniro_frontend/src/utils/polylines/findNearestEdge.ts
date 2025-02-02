import centerCoordinate from "../coordinates/centerCoordinate";
import distance from "../coordinates/distance";

export default function findNearestSubEdge(
	edges: [google.maps.LatLngLiteral, google.maps.LatLngLiteral][],
	point: google.maps.LatLngLiteral,
): {
	edge: [google.maps.LatLngLiteral, google.maps.LatLngLiteral];
	point: google.maps.LatLngLiteral;
} {
	const edgesWithDistance = edges
		.map(([startNode, endNode]) => {
			return {
				edge: [startNode, endNode] as [google.maps.LatLngLiteral, google.maps.LatLngLiteral],
				distance: distance(point, centerCoordinate(startNode, endNode)),
			};
		})
		.sort((a, b) => {
			return a.distance - b.distance;
		});

	const nearestEdge = edgesWithDistance[0].edge;

	const distance0 = distance(nearestEdge[0], point);
	const distance1 = distance(nearestEdge[1], point);
	const nearestPoint = distance0 > distance1 ? nearestEdge[1] : nearestEdge[0];

	return {
		edge: nearestEdge,
		point: nearestPoint,
	};
}
