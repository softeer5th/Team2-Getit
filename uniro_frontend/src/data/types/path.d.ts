import { CustomNode } from "./node";

// 지도 전체 표시할 때 사용
export interface Path {
	id?: string;
	startNode: CustomNode;
	endNode: CustomNode;
	nodeList: CustomNode[];
}
