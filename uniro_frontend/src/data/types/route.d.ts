import { Markers } from "../../constant/enum/markerEnum";
import { CautionIssueType, DangerIssueType } from "../../constant/enum/reportEnum";
import { RoutePoint } from "../../constant/enum/routeEnum";
import { Coord } from "./coord";
import { MarkerTypes } from "./marker";

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

export type RoutePointType = RoutePoint.ORIGIN | RoutePoint.DESTINATION;

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
