import { PassableStatus } from "./enum/reportEnum";

export const THEME_MAP: Record<PassableStatus, string> = {
	[PassableStatus.DANGER]: "border-system-red text-system-red bg-[#FFF5F7]",
	[PassableStatus.CAUTION]: "border-system-orange text-system-orange bg-[#FFF7EF]",
	[PassableStatus.RESTORED]: "border-primary-400 text-primary-400 bg-[#F0F5FE]",
	[PassableStatus.INITIAL]: "bg-gray-100 border-gray-400",
};
