import { RoutePoint } from "../../constant/enums";
import { HazardEdge } from "./edge";

export interface Route {
	route: HazardEdge[];
}

export interface NavigationRoute extends Route {
	hasCaution: boolean;
	totalDistance: number;
	totalCost: number;
}

export type RoutePointType = RoutePoint.ORIGIN | RoutePoint.DESTINATION;
