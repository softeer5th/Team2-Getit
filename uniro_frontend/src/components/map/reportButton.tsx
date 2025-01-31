import { Link } from "react-router";
import ReportIcon from "../../assets/report.svg?react";

export default function ReportButton() {
	return (
		<Link
			to="/"
			className="rounded-full w-fit h-[50px] px-6 py-3 flex flex-row items-center bg-gray-900 text-gray-100"
		>
			제보하기
			<ReportIcon className="ml-3" stroke="#FFFFFF" />
		</Link>
	);
}
