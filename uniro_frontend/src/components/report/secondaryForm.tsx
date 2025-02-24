import { IssueTypeKey, PassableStatus } from "../../constant/enum/reportEnum";
import { IssueQuestionButtons, ReportFormData, ReportModeType } from "../../types/report";

import { FormTitle } from "./formTitle";
import { SecondaryFormButton } from "./secondaryButton";

const buttonConfig = {
	danger: [IssueTypeKey.CURB, IssueTypeKey.STAIRS, IssueTypeKey.SLOPE, IssueTypeKey.ETC],
	caution: [IssueTypeKey.CURB, IssueTypeKey.CRACK, IssueTypeKey.SLOPE, IssueTypeKey.ETC],
} as IssueQuestionButtons;

type SecondaryFormProps = {
	reportMode: ReportModeType;
	formData: ReportFormData;
	handleSecondarySelect: (answer: IssueTypeKey) => void;
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
								contentKey={button}
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
								contentKey={button}
							/>
						);
					})}
			</div>
		</>
	);
};
