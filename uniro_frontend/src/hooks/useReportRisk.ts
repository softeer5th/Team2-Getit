import { create } from "zustand";
import { RouteId } from "../types/route";

interface ReportedRiskRoute {
	reportRouteId: RouteId | undefined;
	setReportRouteId: (selectedRouteId: RouteId) => void;
}

const useReportRisk = create<ReportedRiskRoute>((set) => ({
	reportRouteId: undefined,
	setReportRouteId: (newRouteId: RouteId) => set({ reportRouteId: newRouteId }),
}));

export default useReportRisk;
