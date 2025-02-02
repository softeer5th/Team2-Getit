import React from "react";
import { CautionIssueType, DangerIssueType, PassableStatus } from "../../data/types/report";
import { getThemeByPassableStatus } from "../../utils/report/getThemeByPassableStatus";

export const SecondaryFormButton = ({
	onClick,
	formPassableStatus,
	content,
	isSelected,
}: {
	onClick: (answer: DangerIssueType | CautionIssueType) => void;
	formPassableStatus: PassableStatus;
	content: DangerIssueType | CautionIssueType;
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
