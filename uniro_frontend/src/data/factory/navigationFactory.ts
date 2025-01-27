import { HazardEdge } from "../types/edge";
import { NavigationRoutes } from "../types/route";

export const createNavigationRoutes = (edges: HazardEdge[]): NavigationRoutes => {
	return {
		routes: edges,
		hasCaution: edges.some((edge) => edge.cautionFactors !== undefined),
		totalDistance: 1.5,
		totalCost: 10,
	};
};
