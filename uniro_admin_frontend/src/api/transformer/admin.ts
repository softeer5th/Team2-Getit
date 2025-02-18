import { CoreRoute, Route, RouteId } from "../../data/types/route";
import { RevisionDataType, RevisionType } from "../../data/types/revision";
import { GetRevisionResponse } from "../type/response/admin";
import { NodeId } from "../../data/types/node";

export const transformAllRevisions = (data: RevisionType[]): RevisionType[] => {
	return data.reverse();
};

export const transformGetRevision = (res: GetRevisionResponse, versionId: number): RevisionDataType => {
	const { nodeInfos } = res.routesInfo;
	const { nodeInfos: lostNodeInfos } = res.lostRoutes;
	const nodeMap = new Map(nodeInfos.map((node) => [node.nodeId, node]));
	const lostNodeMap = new Map(lostNodeInfos.map((node) => [node.nodeId, node]));

	const createRoutes = ({
		routeId,
		startNodeId,
		endNodeId,
	}: {
		routeId: RouteId;
		startNodeId: NodeId;
		endNodeId: NodeId;
	}): CoreRoute => {
		const node1 = nodeMap.get(startNodeId);
		const node2 = nodeMap.get(endNodeId);

		if (!node1) {
			throw new Error(`Node not found: ${startNodeId}`);
		}
		if (!node2) {
			throw new Error(`Node not found: ${endNodeId}`);
		}

		return {
			routeId,
			node1,
			node2,
		};
	};

	const createLostRoutes = ({
		routeId,
		startNodeId,
		endNodeId,
	}: {
		routeId: RouteId;
		startNodeId: NodeId;
		endNodeId: NodeId;
	}): CoreRoute => {
		const node1 = lostNodeMap.get(startNodeId);
		const node2 = lostNodeMap.get(endNodeId);

		if (!node1) {
			throw new Error(`Node not found: ${startNodeId}`);
		}
		if (!node2) {
			throw new Error(`Node not found: ${endNodeId}`);
		}

		return {
			routeId,
			node1,
			node2,
		};
	};

	return {
		routesInfo: {
			coreRoutes: res.routesInfo.coreRoutes.map((coreRoute) => {
				return {
					...coreRoute,
					routes: coreRoute.routes.map(createRoutes),
				};
			}),
			buildingRoutes: res.routesInfo.buildingRoutes.map((coreRoute) => {
				return {
					...coreRoute,
					routes: coreRoute.routes.map(createRoutes),
				};
			}),
		},
		risksInfo: res.getRiskRoutesResDTO,
		lostRoutes: {
			...res.lostRoutes,
			coreRoutes: res.lostRoutes.coreRoutes.map((coreRoute) => {
				return {
					...coreRoute,
					routes: coreRoute.routes.map(createLostRoutes),
				};
			}),
		},
		changedList: res.changedList,
		rev: versionId,
	};
};
