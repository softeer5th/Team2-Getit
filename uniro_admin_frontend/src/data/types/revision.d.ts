import { CautionIssueType, DangerIssueType } from "./../../../../uniro_frontend/src/data/types/enum.d";
import { LogActionEnum } from "../../constant/enum/logActionEnum";
import { Node } from "./node";
import { CautionRoute, CoreRoutes, DangerRoute, RouteId } from "./route";

export type RevisionType = {
	rev: number;
	revTime: string;
	univId: number;
	action: LogActionEnum;
};

type ChangedType = {
	cautionFactors: CautionIssueType[];
	dangerFactors: DangerIssueType[];
	cost: number;
};

export type ChangedRouteType = {
	routeId: RouteId;
	current: ChangedType[];
	difference: ChangedType[];
};

export type RevisionDataType = {
	routesInfo: {
		coreRoutes: CoreRoutes[];
		buildingRoutes: CoreRoutes[];
	};
	risksInfo: {
		dangerRoutes: DangerRoute[];
		cautionRoutes: CautionRoute[];
	};
	lostRoutes: {
		nodeInfos: Node[];
		coreRoutes: CoreRoutes[];
	};
	changedList: ChangedRouteType[];
	rev: number;
};
