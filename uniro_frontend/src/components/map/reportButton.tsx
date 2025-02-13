import ReportIcon from "../../assets/report.svg?react";
import { ButtonHTMLAttributes } from "react";

export default function ReportButton({ ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			{...rest}
			className="rounded-full w-fit h-[50px] px-6 py-3 flex flex-row items-center shadow-lg bg-gray-900 text-gray-100"
		>
			제보하기
			<ReportIcon className="ml-3" stroke="#FFFFFF" />
		</button>
	);
}
