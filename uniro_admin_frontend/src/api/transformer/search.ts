import { University } from "../../data/types/university";
import { GetUniversityListResponse } from "../type/response/search";

export const transformGetUniversityList = (res: GetUniversityListResponse): University[] => {
	return res.data;
};
