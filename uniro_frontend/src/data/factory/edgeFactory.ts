import { Direction, HazardEdge, RouteEdge } from "../types/edge";
import { CautionFactor, DangerFactor } from "../types/factor";
import { CustomNode } from "../types/node";

export const createHazardEdge = (
	id: string,
	startNode: CustomNode,
	endNode: CustomNode,
	cautionFactors?: CautionFactor[],
	dangerFactors?: DangerFactor[],
): HazardEdge => ({
	id,
	startNode,
	endNode,
	cautionFactors,
	dangerFactors,
});

export const createRouteEdges = (edges: HazardEdge[]): RouteEdge[] => {
	const routeEdges: RouteEdge[] = [];
	edges.forEach((edge, index) => {
		const routeEdge: RouteEdge = {
			...edge,
			distance: 100,
			direction: ["right", "straight", "left"][index % 3] as Direction,
		};
		routeEdges.push(routeEdge);
	});

	routeEdges[0].direction = "origin";
	routeEdges[routeEdges.length - 1].direction = "destination";

	return routeEdges;
};
