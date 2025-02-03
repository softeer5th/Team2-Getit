import { RoutePoint } from "../../constant/enum/routeEnum";
import { Building } from "./node";

export interface Route {
	route: RouteEdge[];
}

export interface NavigationRoute extends Route {
	hasCaution: boolean;
	totalDistance: number;
	totalCost: number;
	originBuilding: Building;
	destinationBuilding: Building;
}

export type RoutePointType = RoutePoint.ORIGIN | RoutePoint.DESTINATION;
