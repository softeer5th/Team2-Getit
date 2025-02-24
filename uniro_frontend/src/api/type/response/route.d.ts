import { IssueTypeKey } from "../../../constant/enum/reportEnum";
import { Node, NodeId } from "../../../types/node";
import { NavigationRouteType } from "../../../types/route";

type CoreRoutesResponse = {
	coreNode1Id: NodeId;
	coreNode2Id: NodeId;
	routes: {
		routeId: NodeId;
		startNodeId: NodeId;
		endNodeId: NodeId;
	}[];
};

export type GetAllRouteRepsonse = {
	nodeInfos: Node[];
	coreRoutes: CoreRoutesResponse[];
};

export type GetSingleRouteRiskResponse = {
	routeId: NodeId;
	dangerFactors?: IssueTypeKey[];
	cautionFactors?: IssueTypeKey[];
};

export type GetFastestRouteResponse = {
	routeType?: NavigationRouteType;
	hasCaution: boolean;
	hasDanger: boolean;
	totalDistance: number;
	pedestrianTotalCost?: number | null;
	manualTotalCost?: number | null;
	electricTotalCost?: number | null;
	routes: Route[];
	routeDetails: RouteDetail[];
}[];
