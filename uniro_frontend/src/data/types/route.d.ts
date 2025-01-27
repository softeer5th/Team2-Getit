import { HazardEdge } from "./edge";

export interface Routes {
	routes: HazardEdge[];
}

export interface NavigationRoutes extends Routes {
	hasCaution: boolean;
	totalDistance: number;
	totalCost: number;
}
