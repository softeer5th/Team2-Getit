import { Building } from "../../types/node";
import { GetBuildingListResponse } from "../type/response/nodes";

export const transformGetBuildings = (res: GetBuildingListResponse): Building[] => {
	return res.data;
};
