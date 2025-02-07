import { Building } from "../data/types/node";
import { getFetch } from "../utils/fetch/fetch";

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
