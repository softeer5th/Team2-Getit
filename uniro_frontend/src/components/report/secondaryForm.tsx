import { CautionIssue, DangerIssue, PassableStatus } from "../../constant/enum/reportEnum";
import { IssueQuestionButtons, ReportFormData, ReportModeType } from "../../data/types/report";

import { FormTitle } from "./formTitle";
import { SecondaryFormButton } from "./secondaryButton";

const buttonConfig = {
	danger: [DangerIssue.CURB, DangerIssue.CRACK, DangerIssue.SLOPE, DangerIssue.ETC],
	caution: [
		CautionIssue.CURB,
		CautionIssue.STAIRS,
		CautionIssue.SLOPE,
		CautionIssue.ETC,
	],
} as IssueQuestionButtons;

type SecondaryFormProps = {
	reportMode: ReportModeType;
	formData: ReportFormData;
	handleSecondarySelect: (answer: DangerIssue | CautionIssue) => void;
};

export const SecondaryForm = ({ formData, handleSecondarySelect, reportMode }: SecondaryFormProps) => {
	return (
		<>
			{(formData.passableStatus === PassableStatus.CAUTION ||
				formData.passableStatus === PassableStatus.DANGER) && (
					<FormTitle isPrimary={false} reportMode={reportMode} passableStatus={formData.passableStatus} />
				)}
			<div className="flex flex-wrap w-full pt-5 pl-6 pr-4">
				{formData.passableStatus === PassableStatus.CAUTION &&
					buttonConfig.caution.map((button, index) => {
						return (
							<SecondaryFormButton
								onClick={handleSecondarySelect}
								formPassableStatus={formData.passableStatus}
								isSelected={formData.cautionIssues.includes(button)}
								content={button}
								key={index}
							/>
						);
					})}
				{formData.passableStatus === PassableStatus.DANGER &&
					buttonConfig.danger.map((button, index) => {
						return (
							<SecondaryFormButton
								onClick={handleSecondarySelect}
								formPassableStatus={formData.passableStatus}
								isSelected={formData.dangerIssues.includes(button)}
								content={button}
								key={index}
							/>
						);
					})}
			</div>
		</>
	);
};
