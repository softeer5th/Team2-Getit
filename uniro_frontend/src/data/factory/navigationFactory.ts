import { hanyangBuildings } from "../mock/hanyangBuildings";
import { RouteEdge } from "../types/edge";
import { NavigationRoute } from "../types/route";

// TODO: Distance를 m-> km로 자동 변환해주는 util
export const createNavigationRoute = (edges: RouteEdge[]): NavigationRoute => {
	return {
		route: edges,
		hasCaution: edges.some((edge) => edge.cautionFactors !== undefined),
		totalDistance: 635,
		totalCost: 10,
		originBuilding: hanyangBuildings[0],
		destinationBuilding: hanyangBuildings[1],
	};
};
