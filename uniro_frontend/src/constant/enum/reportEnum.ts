export enum PassableStatus {
	DANGER = "DANGER",
	CAUTION = "CAUTION",
	RESTORED = "RESTORED",
	INITIAL = "INITIAL",
}

export enum CautionIssue {
	CURB = "낮은 턱이 있어요",
	CRACK = "도로에 균열이 있어요",
	SLOPE = "낮은 비탈길이 있어요",
	ETC = "그 외 요소",
}

export enum DangerIssue {
	CURB = "높은 턱이 있어요",
	STAIRS = "계단이 있어요",
	SLOPE = "경사가 매우 높아요",
	ETC = "그 외 요소",
}

export enum IssueTypeKey {
	CURB = "CURB",
	CRACK = "CRACK",
	SLOPE = "SLOPE",
	ETC = "ETC",
	STAIRS = "STAIRS",
}
