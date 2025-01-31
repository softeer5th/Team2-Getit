import { createHazardEdge } from "../factory/edgeFactory";
import { createNode } from "../factory/nodeFactory";
import { HazardEdge } from "../types/edge";
import { CustomNode } from "../types/node";

const nodes: CustomNode[] = [
	createNode("4", 37.557669, 127.042007),
	createNode("5", 37.557695, 127.042002),
	createNode("9", 37.557956, 127.04228),
	createNode("10", 37.557956, 127.042314),
	createNode("14", 37.557659, 127.042548),
	createNode("15", 37.557637, 127.04253),
	createNode("20", 37.559317, 127.045131),
	createNode("21", 37.559296, 127.045152),
	createNode("30", 37.559275, 127.043711),
	createNode("31", 37.559301, 127.043705),
];

const edges: HazardEdge[] = [
	createHazardEdge("path0", nodes[0], nodes[1], ["도로에 균열이 있어요"]),
	createHazardEdge("path1", nodes[2], nodes[3], undefined, ["계단이 있어요"]),
	createHazardEdge("path2", nodes[4], nodes[5], ["낮은 턱이 있어요"]),
	createHazardEdge("path3", nodes[6], nodes[7], undefined, ["경사가 높아요"]),
	createHazardEdge("path4", nodes[8], nodes[9], ["낮은 비탈길이 있어요"]),
];

export const mockHazardEdges = edges;
