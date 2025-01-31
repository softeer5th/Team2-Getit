import type { CustomNode } from "../types/node";

export const createNode = (id: string, lat: number, lng: number, isCore: boolean = false): CustomNode => ({
	id,
	lat,
	lng,
	isCore,
});
