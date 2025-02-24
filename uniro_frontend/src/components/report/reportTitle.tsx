import { Link } from "react-router";
import { ReportModeType } from "../../types/report";
import CloseIcon from "../../assets/icon/close.svg?react";
export const ReportTitle = ({ reportMode }: { reportMode: ReportModeType }) => {
	const CREATE_TITLE = "불편한 길을 알려주세요.";
	const UPDATE_TITLE = "불편한 길을 수정해주세요.";
	return (
		<div className="flex flex-col items-start justify-center max-w-[450px] w-full bg-gray-100 py-6 pl-6 text-left text-gray-900 text-kor-heading1 font-semibold">
			{reportMode === "create" ? CREATE_TITLE : UPDATE_TITLE}
			<Link to="/report/risk" className="absolute top-6 right-6">
				<CloseIcon />
			</Link>
		</div>
	);
};
