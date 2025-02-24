import {
	CoreRoutesList,
	NavigationButtonRouteType,
	NavigationRouteListRecord,
	NavigationRouteListRecordWithMetaData,
} from "../../types/route";
import { GetAllRouteRepsonse, GetFastestRouteResponse } from "../type/response/route";

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

export const transformFastRoute = (data: GetFastestRouteResponse): NavigationRouteListRecordWithMetaData => {
	// data의 routeType "PEDES" | "WHEEL_FAST" | "WHEEL_SAFE"
	// export type NavigtionButtonType = "PEDES" | "MANUAL" | "ELECTRIC";
	// export type RouteType = "safe" | "caution";
	// export type NavigationButtonRouteType = `${NavigationButtonType} & ${Uppercase<RouteType>}`;

	// PEDES-SAFE , PEDES-CAUTION, MANUAL-SAFE, MANUAL-CAUTION, ELECTRIC-SAFE, ELECTRIC-CAUTION
	// PEDES-SAFE pedestrianDistance -> totalDistance PEDES-CAUTION pedestrianDistance -> totalDistance
	// MANUAL-SAFE WHEEL_SAFE 일 때, manualDistance를 넣음
	// MANUAL-CAUTION WHEEL_FAST 일 때, manualDistance를 넣음
	// ELECTRIC-SAFE WHEEL_SAFE 일 때, electricDistance를 넣음
	// ELECTRIC-CAUTION WHEEL_FAST 일 때, electricDistance를 넣음

	// data의 길이가 1 : PED & SAFE (위험 & 주의를 포함한 길이 없기 때문)
	// data의 길이가 2 : PED & SAFE, PED & CAUTION, ELECTRIC & CAUTION, MANUAL & CAUTION  (위험을 포함한 길이 없기 때문)
	// data의 길이가 3 : 모두 온 거

	const record: NavigationRouteListRecord = {};
	let defaultMode: NavigationButtonRouteType = "PEDES & SAFE";
	data.forEach((route) => {
		switch (route.routeType) {
			case "PEDES":
				// PEDES-SAFE는 항상 존재, PEDES-CAUTION은 존재하지 않
				record[`PEDES & SAFE`] = {
					hasCaution: route.hasCaution,
					hasDanger: route.hasDanger,
					totalDistance: route.totalDistance,
					totalCost: route.pedestrianTotalCost ?? 0,
					routes: route.routes,
					routeDetails: route.routeDetails,
				};
				break;
			case "WHEEL_FAST":
				if (route.manualTotalCost && route.hasCaution) {
					defaultMode = "MANUAL & CAUTION";
					record[`MANUAL & CAUTION`] = {
						hasCaution: route.hasCaution,
						hasDanger: route.hasDanger,
						totalDistance: route.totalDistance,
						totalCost: route.manualTotalCost ?? 0,
						routes: route.routes,
						routeDetails: route.routeDetails,
					};
				}
				if (route.electricTotalCost && route.hasCaution) {
					defaultMode = "MANUAL & CAUTION";
					record[`ELECTRIC & CAUTION`] = {
						hasCaution: route.hasCaution,
						hasDanger: route.hasDanger,
						totalDistance: route.totalDistance,
						totalCost: route.electricTotalCost ?? 0,
						routes: route.routes,
						routeDetails: route.routeDetails,
					};
				}
				break;
			case "WHEEL_SAFE":
				if (route.manualTotalCost && !route.hasCaution) {
					defaultMode = "MANUAL & SAFE";
					record[`MANUAL & SAFE`] = {
						hasCaution: route.hasCaution,
						hasDanger: route.hasDanger,
						totalDistance: route.totalDistance,
						totalCost: route.manualTotalCost ?? 0,
						routes: route.routes,
						routeDetails: route.routeDetails,
					};
				}
				if (route.electricTotalCost && !route.hasCaution) {
					defaultMode = "MANUAL & SAFE";
					record[`ELECTRIC & SAFE`] = {
						hasCaution: route.hasCaution,
						hasDanger: route.hasDanger,
						totalDistance: route.totalDistance,
						totalCost: route.electricTotalCost ?? 0,
						routes: route.routes,
						routeDetails: route.routeDetails,
					};
				}
				break;
		}
	});

	return {
		...record,
		dataLength: data.length,
		defaultMode,
	};
};
