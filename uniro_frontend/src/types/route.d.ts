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

export type NavigtionButtonType = "PEDES" | "MANUAL" | "ELECTRIC";
// API 응답용 Type
export type NavigationRouteType = "PEDES" | "WHEEL_FAST" | "WHEEL_SAFE";
export type RouteType = "safe" | "caution" | "normal";
export type NavigationButtonRouteType = `${NavigationButtonType} & ${Uppercase<RouteType>}`;

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
	dangerFactors: DangerIssueType[];
};

export type NavigationRouteList = {
	hasCaution: boolean;
	hasDanger: boolean;
	totalDistance: number;
	totalCost: number;
	routes: Route[];
	routeDetails: RouteDetail[];
};

export type NavigationRouteListRecord = Record<NavigationButtonRouteType, NavigationRouteList>;
export type NavigationRouteListRecordWithMetaData = NavigationRouteListRecord & {
	dataLength: number;
	defaultMode: NavigationButtonRouteType;
};
