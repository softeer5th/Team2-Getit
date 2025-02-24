import { PassableStatus } from "../../constant/enum/reportEnum";
import { PrimaryQuestionButton, ReportModeType } from "../../types/report";

import { FormTitle } from "./formTitle";
import { PrimaryFormButton } from "./primaryButton";

const buttonConfig = [
	{ content: "통행이 불가능해요", passableStatus: PassableStatus.DANGER },
	{ content: "통행이 가능하지만 주의가 필요해요", passableStatus: PassableStatus.CAUTION },
	{ content: "통행이 가능해졌어요", passableStatus: PassableStatus.RESTORED, mode: "update" },
] as PrimaryQuestionButton[];

interface PrimaryFormProps {
	passableStatus: PassableStatus;
	handlePrimarySelect: (status: PassableStatus) => void;
	reportMode: ReportModeType;
}

export const PrimaryForm = ({ passableStatus, handlePrimarySelect, reportMode }: PrimaryFormProps) => {
	return (
		<>
			<FormTitle isPrimary={true} reportMode={reportMode} passableStatus={passableStatus} />
			<div className="flex flex-wrap w-full pt-5 pl-6 space-y-3 pr-4 space-x-3">
				{buttonConfig.map((button, index) => {
					if (button.mode && button.mode !== reportMode) return null;
					return (
						<PrimaryFormButton
							key={index}
							onClick={handlePrimarySelect}
							formPassableStatus={passableStatus}
							passableStatus={button.passableStatus}
							content={button.content}
						/>
					);
				})}
			</div>
		</>
	);
};
