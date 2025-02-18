import ErrorIcon from "../../assets/error/error.svg?react";

export default function NotFound() {
	return (
		<div className="w-[285px] h-[198px] flex flex-col items-center py-2 space-y-[14px]">
			<ErrorIcon />
			<div className="space-y-[6px]">
				<h3 className="text-kor-heading2 font-semibold text-gray-900">잘못된 접근입니다.</h3>
				<p className="text-kor-body2 font-medium text-gray-700">다른 페이지로 이동해주세요.</p>
			</div>
		</div>
	);
}
