import React from "react";
import { getThemeByPassableStatus } from "../../utils/report/getThemeByPassableStatus";
import { CautionIssue, DangerIssue, IssueTypeKey, PassableStatus } from "../../constant/enum/reportEnum";
import { CautionIssueType, DangerIssueType } from "../../types/enum";

export const SecondaryFormButton = ({
	onClick,
	formPassableStatus,
	isSelected,
	contentKey,
}: {
	onClick: (answer: IssueTypeKey) => void;
	formPassableStatus: PassableStatus;
	isSelected: boolean;
	contentKey: IssueTypeKey;
}) => {
	return (
		<button
			onClick={() => onClick(contentKey)}
			className={`mb-3 mr-3 py-[18px] px-[22px] border-[1px] rounded-[20px] w-fit text-kor-body2 border-gray-400 ${isSelected && getThemeByPassableStatus(formPassableStatus)}`}
		>
			{formPassableStatus === PassableStatus.CAUTION
				? CautionIssue[contentKey as CautionIssueType]
				: DangerIssue[contentKey as DangerIssueType]}
		</button>
	);
};
