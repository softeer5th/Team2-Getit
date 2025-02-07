import { Link } from "react-router";
import ChevronRight from "../../../public/icons/chevron-right.svg?react";

interface ReportModalProps {
	close: () => void;
}

export default function ReportModal({ close }: ReportModalProps) {
	return (
		<div
			className="fixed inset-0 flex flex-col items-center justify-end bg-[rgba(0,0,0,0.2)] z-20 py-6 px-4 space-y-[10px]"
			onClick={close}
		>
			<Link
				to={"/report/route"}
				className="w-full max-w-[418px] h-[58px] flex items-center justify-between px-5 bg-gray-100 rounded-400 text-kor-body2 font-semibold text-primary-500"
			>
				<p>새로운 길 제보</p>
				<ChevronRight fill="none" />
			</Link>

			<Link
				to={"/report/risk"}
				className="w-full max-w-[418px] h-[58px] flex items-center justify-between px-5 bg-gray-100 rounded-400 text-kor-body2 font-semibold text-primary-500"
			>
				<p>불편한 길 제보</p>
				<ChevronRight fill="none" />
			</Link>
		</div>
	);
}
