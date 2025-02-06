import { Markers } from "../../constant/enum/markerEnum";
import { DangerIssue, CautionIssue } from "../../constant/enum/reportEnum";

export type DangerIssueType = keyof typeof DangerIssue;
export type CautionIssueType = keyof typeof CautionIssue;
export type MarkerTypes = (typeof Markers)[keyof typeof Markers];
