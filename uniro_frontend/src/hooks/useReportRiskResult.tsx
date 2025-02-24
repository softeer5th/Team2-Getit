import { create } from "zustand";
import { RouteId } from "../types/route";
import { CautionFactor, DangerFactor } from "../types/factor";

interface ReportedRiskResult {
	reportedData: {
		universityId: number | undefined;
		routeId: RouteId | undefined;
		cautionFactors: CautionFactor[];
		dangerFactors: DangerFactor[];
	};
	setReportedRouteData: (params: {
		universityId: number;
		routeId: RouteId;
		cautionFactors: CautionFactor[];
		dangerFactors: DangerFactor[];
	}) => void;
	clearReportedRouteData: () => void;
}

const useReportedRisk = create<ReportedRiskResult>((set) => ({
	reportedData: {
		universityId: undefined,
		routeId: undefined,
		reportedCoord: undefined,
		cautionFactors: [],
		dangerFactors: [],
	},
	setReportedRouteData: ({
		universityId,
		routeId,
		cautionFactors,
		dangerFactors,
	}: {
		universityId: number;
		routeId: RouteId;
		cautionFactors: CautionFactor[];
		dangerFactors: DangerFactor[];
	}) =>
		set((state) => ({
			reportedData: {
				...state.reportedData,
				universityId,
				routeId,
				cautionFactors,
				dangerFactors,
			},
		})),
	clearReportedRouteData: () => {
		set(() => ({
			reportedData: {
				universityId: undefined,
				routeId: undefined,
				reportedCoord: undefined,
				cautionFactors: [],
				dangerFactors: [],
			},
		}));
	},
}));

export default useReportedRisk;
