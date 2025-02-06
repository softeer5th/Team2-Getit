import { CautionIssue, DangerIssue } from "../../constant/enum/reportEnum";

export type DangerIssueType = keyof typeof DangerIssue;
export type CautionIssueType = keyof typeof CautionIssue;
