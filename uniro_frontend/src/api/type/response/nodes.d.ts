import { Building } from "../../../data/types/node";

export type GetBuildingListResponse = {
	data: Building[];
	nextCursor: number | null;
	hasNext: boolean;
};
