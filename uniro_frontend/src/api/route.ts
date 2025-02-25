import { IssueTypeKey } from "../constant/enum/reportEnum";
import { Coord } from "../types/coord";
import { CautionIssueType, DangerIssueType } from "../types/enum";
import { NodeId } from "../types/node";

import { CoreRoutesList, NavigationRouteListRecordWithMetaData, RouteId } from "../types/route";
import { getFetch, postFetch } from "../utils/fetch/fetch";
import { transformAllRoutes, transformFastRoute } from "./transformer/route";
import { GetAllRouteRepsonse, GetFastestRouteResponse } from "./type/response/route";

export const getNavigationResult = (
	univId: number,
	startNodeId: NodeId,
	endNodeId: NodeId,
): Promise<NavigationRouteListRecordWithMetaData> => {
	return getFetch<GetFastestRouteResponse>(`/${univId}/routes/fastest`, {
		"start-node-id": startNodeId,
		"end-node-id": endNodeId,
	}).then((data) => transformFastRoute(data));
};

export const getAllRoutes = (univId: number): Promise<CoreRoutesList> => {
	return getFetch<GetAllRouteRepsonse>(`/${univId}/routes/stream`).then((data) => transformAllRoutes(data));
};

export const getSingleRouteRisk = (
	univId: number,
	routeId: RouteId,
): Promise<{
	routeId: NodeId;
	dangerFactors: IssueTypeKey[];
	cautionFactors: IssueTypeKey[];
}> => {
	return getFetch<{
		routeId: NodeId;
		dangerFactors: IssueTypeKey[];
		cautionFactors: IssueTypeKey[];
	}>(`/${univId}/routes/${routeId}/risk`);
};

export const postReport = (
	univId: number,
	routeId: RouteId,
	body: { dangerFactors: DangerIssueType[]; cautionFactors: CautionIssueType[] },
): Promise<boolean> => {
	return postFetch<boolean, string>(`/${univId}/route/risk/${routeId}`, body);
};

export const postReportRoute = (
	univId: number,
	body: {
		startNodeId: NodeId;
		endNodeId: NodeId | null;
		coordinates: Coord[];
	},
): Promise<GetAllRouteRepsonse> => {
	return postFetch<GetAllRouteRepsonse, Coord[] | NodeId | null>(
		`/${univId}/route`,
		body,
	) as Promise<GetAllRouteRepsonse>;
};
