import { RouteEdge } from "./edge";
import { Building } from "./node";

export interface Route {
	route: RouteEdge[];
}

export interface NavigationRoute extends Route {
	hasCaution: boolean;
	totalDistance: number;
	totalCost: number;
	startBuilding: Building;
	destinationBuilding: Building;
}
