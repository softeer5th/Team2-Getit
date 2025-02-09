import { PassableStatus } from "../../constant/enum/reportEnum";
import { THEME_MAP } from "../../constant/reportTheme";

export const getThemeByPassableStatus = (status: PassableStatus): string => {
	return THEME_MAP[status];
};
