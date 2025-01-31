import type { CustomNode } from "../types/node";
import type { Path } from "../types/path";

export const convertToCoreNode = (data: { id: string; lat: number; lng: number }): CustomNode => {
	return {
		id: data.id,
		lat: data.lat,
		lng: data.lng,
		isCore: true,
	};
};

export const convertToSubNode = (data: { id: string; lat: number; lng: number }): CustomNode => {
	return {
		id: data.id,
		lat: data.lat,
		lng: data.lng,
		isCore: false,
	};
};

export const convertToPath = (pathKey: string, nodesData: { id: string; lat: number; lng: number }[]): Path => {
	const nodeList = nodesData.map((node) => convertToSubNode(node));
	const startNode = convertToCoreNode(nodesData[0]);
	const endNode = convertToCoreNode(nodesData[nodesData.length - 1]);

	nodeList[0] = startNode;
	nodeList[nodeList.length - 1] = endNode;

	return {
		id: pathKey,
		startNode,
		endNode,
		nodeList,
	};
};

export const convertToPaths = (pathData: { [key: string]: { id: string; lat: number; lng: number }[] }): Path[] => {
	return Object.keys(pathData).map((pathKey) => convertToPath(pathKey, pathData[pathKey]));
};
