import { CautionFactor, DangerFactor } from "./factor";
import { CustomNode } from "./node";

export interface Edge {
	id: string;
	startNode: CustomNode;
	endNode: CustomNode;
}

// 위험 요소 & 주의 요소
// 마커를 표시하거나, 길 찾기 결과의 경로를 그릴 때 사용
export interface HazardEdge extends Edge {
	dangerFactors?: DangerFactor[];
	cautionFactors?: CautionFactor[];
}
