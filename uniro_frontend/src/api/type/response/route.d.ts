import { IssueTypeKey } from "../../../constant/enum/reportEnum";
import { Node, NodeId } from "../../../data/types/node";

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
