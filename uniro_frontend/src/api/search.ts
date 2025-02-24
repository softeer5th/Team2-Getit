import { University } from "../types/university";
import { getFetch } from "../utils/fetch/fetch";
import { transformGetUniversityList } from "./transformer/search";
import { GetUniversityListResponse } from "./type/response/search";

export const getUniversityList = (query: string): Promise<University[]> => {
	return getFetch<GetUniversityListResponse>("/univ/search", { name: query }).then(transformGetUniversityList);
};
