import { CoreRoutesList, NavigationRouteList } from "../../data/types/route";
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

export const transformFastRoute = (data: NavigationRouteList): NavigationRouteList[] => {
	return [
		{
			...data,
			routeType: "PEDES",
			pedestrianTotalCost: Math.floor(data.totalCost ?? 2) > 1 ? (data.totalCost ?? 2 - 1) : data.totalCost,
		},
		{
			...data,
			routeType: "WHEEL_FAST",
			manualTotalCost: (data.totalCost ?? 2) + 2,
			electricTotalCost: data.totalCost ?? 2,
		},
		{
			...data,
			routeType: "WHEEL_SAFE",
			manualTotalCost: (data.totalCost ?? 2) + 4,
			electricTotalCost: (data.totalCost ?? 2) + 2,
		},
	];
};
