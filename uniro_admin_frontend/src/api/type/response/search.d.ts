export type GetUniversityListResponse = {
	data: University[];
	nextCursor: number | null;
	hasNext: boolean;
};
