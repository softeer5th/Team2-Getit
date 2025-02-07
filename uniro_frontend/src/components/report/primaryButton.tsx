import { useState } from "react";
import { getThemeByPassableStatus } from "../../utils/report/getThemeByPassableStatus";
import { PassableStatus } from "../../constant/enum/reportEnum";

export const PrimaryFormButton = ({
	onClick,
	formPassableStatus,
	passableStatus,
	content,
}: {
	onClick: (status: PassableStatus) => void;
	formPassableStatus: PassableStatus;
	passableStatus: PassableStatus;
	content: string;
}) => {
	const [selectedThemeString, _] = useState<string>(getThemeByPassableStatus(passableStatus));
	return (
		<button
			onClick={() => onClick(passableStatus)}
			className={`mb-3 mr-3 py-[18px] px-[22px] border-[1px] rounded-[20px] w-fit text-kor-body2 border-gray-400 ${formPassableStatus === passableStatus && selectedThemeString}`}
		>
			{content}
		</button>
	);
};
