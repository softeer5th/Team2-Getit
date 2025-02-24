import { CautionIssue, DangerIssue, PassableStatus } from "../../constant/enum/reportEnum";

export type ReportModeType = "create" | "update";

export interface PrimaryQuestionButton {
	content: string;
	passableStatus: PassableStatus;
	mode?: ReportModeType;
}

export interface IssueQuestionButtons {
	danger: DangerIssue[];
	caution: CautionIssue[];
}
export interface ReportFormData {
	passableStatus: PassableStatus;
	dangerIssues: IssueTypeKey[];
	cautionIssues: IssueTypeKey[];

}
