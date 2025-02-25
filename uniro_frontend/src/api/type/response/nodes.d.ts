import { Building } from "../../../types/node";

export type GetBuildingListResponse = {
	data: Building[];
	nextCursor: number | null;
	hasNext: boolean;
};
