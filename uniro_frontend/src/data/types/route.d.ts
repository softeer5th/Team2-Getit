import { Markers } from "../../constant/enum/markerEnum";
import { CautionIssueType, DangerIssueType } from "../../constant/enum/reportEnum";
import { RoutePoint } from "../../constant/enum/routeEnum";
import { Coord } from "./coord";
import { MarkerTypes } from "./marker";
import { Node } from "./node";

export type RouteId = number;

export type Route = {
	routeId: RouteId;
	node1: Coord;
	node2: Coord;
};

export type Direction = "origin" | "right" | "straight" | "left" | "uturn" | "destination" | "caution";

export interface CautionRoute extends Route {
	cautionFactors: CautionIssueType[];
}

export interface DangerRoute extends Route {
	dangerFactors: DangerIssueType[];
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

export type RoutePointType = RoutePoint.ORIGIN | RoutePoint.DESTINATION;

export type RouteDetail = {
	dist: number;
	directionType: Direction;
	coordinates: Coord;
	cautionFactors: CautionIssueType[];
};

export type NavigationRouteList = {
	hasCaution: boolean;
	totalDistance: number;
	totalCost: number;
	routes: Route[];
	routeDetails: RouteDetail[];
};
