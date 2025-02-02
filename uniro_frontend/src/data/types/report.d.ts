import { CautionIssueType, DangerIssueType, PassableStatus } from "../../constant/enum/reportEnum";

export type ReportModeType = "create" | "update";

export interface PrimaryQuestionButton {
	content: string;
	passableStatus: PassableStatus;
	mode?: ReportModeType;
}

export interface IssueQuestionButtons {
	danger: DangerIssueType[];
	caution: CautionIssueType[];
}
export interface ReportFormData {
	passableStatus: PassableStatus;
	dangerIssues: DangerIssueType[];
	cautionIssues: CautionIssueType[];
}
