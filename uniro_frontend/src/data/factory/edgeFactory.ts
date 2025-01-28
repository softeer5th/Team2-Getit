import { HazardEdge } from "../types/edge";
import { CautionFactor, DangerFactor } from "../types/factor";
import { CustomNode } from "../types/node";

export const createHazardEdge = (
	id: string,
	startNode: CustomNode,
	endNode: CustomNode,
	cautionFactors?: CautionFactor[],
	dangerFactors?: DangerFactor[],
): HazardEdge => ({
	id,
	startNode,
	endNode,
	cautionFactors,
	dangerFactors,
});
