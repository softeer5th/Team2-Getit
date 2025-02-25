import { NodeId } from "../data/types/node";
import { CoreRoutesList } from "../data/types/route";
import { getFetch, postFetch } from "../utils/fetch/fetch";
import { transformAllRoutes } from "./transformer/route";
import { GetAllRouteRepsonse } from "./type/response/route";
import { CautionRoute, DangerRoute } from "../data/types/route";

export const getAllRoutes = (univId: number): Promise<CoreRoutesList> => {
	return getFetch<GetAllRouteRepsonse>(`/${univId}/routes/stream`).then((data) => transformAllRoutes(data));
};

export const postBuildingRoute = (
	univId: number,
	body: {
		buildingNodeId: NodeId;
		nodeId: NodeId;
	},
): Promise<boolean> => {
	return postFetch(`/${univId}/routes/building`, body);
};

export const getAllRisks = (
	univId: number,
): Promise<{ dangerRoutes: DangerRoute[]; cautionRoutes: CautionRoute[] }> => {
	return getFetch<{ dangerRoutes: DangerRoute[]; cautionRoutes: CautionRoute[] }>(`/${univId}/routes/risks`);
};
