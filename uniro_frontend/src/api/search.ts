import { University } from "../data/types/university";
import { getFetch } from "../utils/fetch/fetch";

export const getUniversityList = (): Promise<{ data: University[]; nextCursor: number | null; hasNext: boolean }> => {
	return getFetch<{ data: University[]; nextCursor: number | null; hasNext: boolean }>("/univ/search");
};
