export interface CustomNode {
	id?: string;
	lng: number;
	lat: number;
	isCore?: boolean;
}

// 건물 노드의 정보를 담고 있음
export interface Building extends CustomNode {
	buildingName: string;
	buildingImageUrl?: string;
	phoneNumber: string;
	address: string;
}
