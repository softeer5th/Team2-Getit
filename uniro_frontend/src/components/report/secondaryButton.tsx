import React from "react";
import { getThemeByPassableStatus } from "../../utils/report/getThemeByPassableStatus";
import { CautionIssue, DangerIssue, PassableStatus } from "../../constant/enum/reportEnum";

export const SecondaryFormButton = ({
	onClick,
	formPassableStatus,
	content,
	isSelected,
}: {
	onClick: (answer: DangerIssue | CautionIssue) => void;
	formPassableStatus: PassableStatus;
	content: DangerIssue | CautionIssue;
	isSelected: boolean;
}) => {
	return (
		<button
			onClick={() => onClick(content)}
			className={`mb-3 mr-3 py-[18px] px-[22px] border-[1px] rounded-[20px] w-fit text-kor-body2 border-gray-400 ${isSelected && getThemeByPassableStatus(formPassableStatus)}`}
		>
			{content}
		</button>
	);
};
