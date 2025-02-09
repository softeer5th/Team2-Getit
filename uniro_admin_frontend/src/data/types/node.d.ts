import { Coord } from "./coord";

export type NodeId = number;

export interface Node extends Coord {
	nodeId: NodeId;
}

export interface Building extends Node {
	buildingName: string;
	buildingImageUrl: string;
	phoneNumber: string;
	address: string;
}
