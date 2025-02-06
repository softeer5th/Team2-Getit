import { CautionIssueType, DangerIssueType } from "../../constant/enum/reportEnum";
import { Coord } from "./coord";
import { Node } from "./node";

export type RouteId = number;

export type Route = {
	routeId: RouteId;
	node1: Coord;
	node2: Coord;
};

export type Direction = "origin" | "right" | "straight" | "left" | "uturn" | "destination" | "caution";

export interface CautionRoute extends Route {
	cautionTypes: CautionIssueType[];
}

export interface DangerRoute extends Route {
	dangerTypes: DangerIssueType[];
}

export interface NavigationRoute extends Route {
	cautionTypes: CautionIssueType[];
}

export interface CoreRoute {
	routeId: RouteId;
	node1: Node;
	node2: Node;
}

export interface CoreRoutes {
	coreNode1Id: NodeId;
	coreNode2Id: NodeId;
	routes: CoreRoute[];
}

export type CoreRoutesList = CoreRoutes[];

export type RouteDetail = {
	dist: number;
	directionType: Direction;
	coordinates: Coord;
};

export type NavigationRouteList = {
	hasCaution: boolean;
	totalDistance: number;
	totalCost: number;
	routes: NavigationRoute[];
	routeDetails: RouteDetail[];
};
