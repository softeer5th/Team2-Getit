import { Node } from "../../../data/types/node";
import { ChangedRouteType } from "../../../data/types/revision";
import { DangerRoute, CautionRoute, RouteId } from "../../../data/types/route";

export type GetRevisionResponse = {
	routesInfo: {
		nodeInfos: Node[];
		coreRoutes: CoreRoutesResponse[];
		buildingRoutes: CoreRoutesResponse[];
	};
	getRiskRoutesResDTO: {
		dangerRoutes: DangerRoute[];
		cautionRoutes: CautionRoute[];
	};
	lostRoutes: {
		nodeInfos: Node[];
		coreRoutes: CoreRoutesResponse[];
	};
	changedList: ChangedRouteType[];
};

type CoreRoutesResponse = {
	coreNode1Id: NodeId;
	coreNode2Id: NodeId;
	routes: {
		routeId: RouteId;
		startNodeId: NodeId;
		endNodeId: NodeId;
	}[];
};
