import { createHazardEdge, createRouteEdges } from "../factory/edgeFactory";
import { createNavigationRoute } from "../factory/navigationFactory";
import { createNode } from "../factory/nodeFactory";
import { HazardEdge } from "../types/edge";
import { CustomNode } from "../types/node";

const nodes: CustomNode[] = [
	createNode("0", 37.557564, 127.042027),
	createNode("15", 37.557947, 127.041952),
	createNode("26", 37.557967, 127.042795),
	createNode("20", 37.557527, 127.042442),
	createNode("38", 37.558756, 127.042418),
];

const edges: HazardEdge[] = [
	createHazardEdge("route1", nodes[0], nodes[1]),
	createHazardEdge("route2", nodes[1], nodes[2], ["도로에 균열이 있어요"]),
	createHazardEdge("route3", nodes[2], nodes[3]),
	createHazardEdge("route4", nodes[3], nodes[4]),
	createHazardEdge("route5", nodes[3], nodes[4]),
	createHazardEdge("route6", nodes[3], nodes[4]),
];

export const mockNavigationRoute = createNavigationRoute(createRouteEdges(edges));
