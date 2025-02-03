import { create } from "zustand";

interface ReportedHazardEdge {
	reportType: "CREATE" | "UPDATE" | undefined;
	setReportType: (type: "CREATE" | "UPDATE") => void;
	startNode: google.maps.LatLng | google.maps.LatLngLiteral | undefined;
	endNode: google.maps.LatLng | google.maps.LatLngLiteral | undefined;
	setNode: (
		point1: google.maps.LatLng | google.maps.LatLngLiteral,
		point2: google.maps.LatLng | google.maps.LatLngLiteral,
	) => void;
}

const useReportHazard = create<ReportedHazardEdge>((set) => ({
	reportType: undefined,
	setReportType: (newType) => set(() => ({ reportType: newType })),
	startNode: undefined,
	endNode: undefined,
	setNode: (point1, point2) => set(() => ({ startNode: point1, endNode: point2 })),
}));

export default useReportHazard;
