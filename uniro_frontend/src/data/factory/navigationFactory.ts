import { HazardEdge } from "../types/edge";
import { NavigationRoute } from "../types/route";

export const createNavigationRoute = (edges: HazardEdge[]): NavigationRoute => {
	return {
		route: edges,
		hasCaution: edges.some((edge) => edge.cautionFactors !== undefined),
		totalDistance: 1.5,
		totalCost: 10,
	};
};
