import { CautionRoute, DangerRoute } from "../types/route";
import { getFetch } from "../utils/fetch/fetch";

export const getAllRisks = (
	univId: number,
): Promise<{ dangerRoutes: DangerRoute[]; cautionRoutes: CautionRoute[] }> => {
	return getFetch<{ dangerRoutes: DangerRoute[]; cautionRoutes: CautionRoute[] }>(`/${univId}/routes/risks`);
};
