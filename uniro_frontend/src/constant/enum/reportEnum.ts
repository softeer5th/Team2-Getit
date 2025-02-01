export enum PassableStatus {
	DANGER = "DANGER",
	CAUTION = "CAUTION",
	RESTORED = "RESTORED",
	INITIAL = "INITIAL",
}

export enum DangerIssueType {
	LOW_STEP = "낮은 턱이 있어요",
	CRACK = "도로에 균열이 있어요",
	LOW_SLOPE = "낮은 비탈길이 있어요",
	OTHERS = "그 외 요소",
}

export enum CautionIssueType {
	HIGH_STEP = "높은 턱이 있어요",
	STAIRS = "계단이 있어요",
	STEEP_SLOPE = "경사가 매우 높아요",
	OTHERS = "그 외 요소",
}
