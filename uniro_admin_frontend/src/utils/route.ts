import { Node, NodeId } from "../data/types/node";
import { CoreRoutesList } from "../data/types/route";

type CoreRoutesResponse = {
  coreNode1Id: NodeId;
  coreNode2Id: NodeId;
  routes: {
    routeId: NodeId;
    startNodeId: NodeId;
    endNodeId: NodeId;
  }[];
};

export const transformAllRoutes = (data: {
  nodeInfos: Node[];
  coreRoutes: CoreRoutesResponse[];
}): CoreRoutesList => {
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
