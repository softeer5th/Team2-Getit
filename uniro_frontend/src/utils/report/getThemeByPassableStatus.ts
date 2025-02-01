import { PassableStatus } from "../../constant/enum/reportEnum";

export const getThemeByPassableStatus = (status: PassableStatus): string => {
	const orangeTheme = "border-system-orange text-system-orange bg-[#FFF7EF]";
	const redTheme = "border-system-red text-system-red bg-[#FFF5F7]";
	const blueTheme = "border-primary-400 text-primary-400 bg-[#F0F5FE]";
	const whiteTheme = "bg-gray-100 border-gray-400";

	switch (status) {
		case PassableStatus.DANGER:
			return redTheme;
		case PassableStatus.CAUTION:
			return orangeTheme;
		case PassableStatus.RESTORED:
			return blueTheme;
		case PassableStatus.INITIAL:
		default:
			return whiteTheme;
	}
};
