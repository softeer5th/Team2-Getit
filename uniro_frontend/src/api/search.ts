import { University } from "../data/types/university";
import { getFetch } from "../utils/fetch/fetch";
import { transformGetUniversityList } from "./transformer/search";

export const getUniversityList = (): Promise<University[]> => {
	return getFetch<{ data: University[]; nextCursor: number | null; hasNext: boolean }>("/univ/search").then(
		transformGetUniversityList,
	);
};
