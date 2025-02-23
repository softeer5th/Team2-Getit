import { CoreRoutesList } from "../../data/types/route";
import { GetAllRouteRepsonse } from "../type/response/route";

export const transformAllRoutes = (data: GetAllRouteRepsonse): CoreRoutesList => {
	const { nodeInfos, coreRoutes } = data;
	const nodeInfoMap = new Map(nodeInfos.map((node) => [node.nodeId, node]));

	return coreRoutes.map((coreRoute) => {
		return {
			...coreRoute,
			routes: coreRoute.routes.map((route) => {
				const node1 = nodeInfoMap.get(route.startNodeId);
				const node2 = nodeInfoMap.get(route.endNodeId);

				if (!node1) {
					throw new Error(`Node not found: ${route.startNodeId}`);
				}
				if (!node2) {
					throw new Error(`Node not found: ${route.endNodeId}`);
				}

				return {
					routeId: route.routeId,
					node1,
					node2,
				};
			}),
		};
	});
};
