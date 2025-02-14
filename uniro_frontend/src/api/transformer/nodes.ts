import { Building } from "../../data/types/node";
import { GetBuildingListResponse } from "../type/response/nodes";

export const transformGetBuildings = (res: GetBuildingListResponse): Building[] => {
	return res.data;
};
