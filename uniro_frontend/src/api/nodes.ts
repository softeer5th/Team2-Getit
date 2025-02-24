import { Building } from "../types/node";
import { getFetch } from "../utils/fetch/fetch";
import { transformGetBuildings } from "./transformer/nodes";
import { GetBuildingListResponse } from "./type/response/nodes";

export const getAllBuildings = (
	univId: number,
	params: {
		leftUpLng: number;
		leftUpLat: number;
		rightDownLng: number;
		rightDownLat: number;
	},
): Promise<Building[]> => {
	return getFetch<Building[]>(`/${univId}/nodes/buildings`, {
		"left-up-lng": params.leftUpLng,
		"left-up-lat": params.leftUpLat,
		"right-down-lng": params.rightDownLng,
		"right-down-lat": params.rightDownLat,
	});
};

export const getSearchBuildings = (
	univId: number,
	params: { name: string; "page-size": number },
): Promise<Building[]> => {
	return getFetch<GetBuildingListResponse>(`/${univId}/nodes/buildings/search`, params).then(transformGetBuildings);
};
