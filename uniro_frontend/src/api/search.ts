import { University } from "../data/types/university";
import { getFetch } from "../utils/fetch/fetch";
import { transformGetUniversityList } from "./transformer/search";
import { GetUniversityListResponse } from "./type/response/search";

export const getUniversityList = (): Promise<University[]> => {
	return getFetch<GetUniversityListResponse>("/univ/search").then(transformGetUniversityList);
};
