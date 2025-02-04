import ErrorIcon from "../../assets/error/error.svg?react";

export default function Error() {
	return (
		<div className="w-[285px] h-[198px] flex flex-col items-center py-2 space-y-[14px]">
			<ErrorIcon />
			<div className="space-y-[6px]">
				<h3 className="text-kor-heading2 font-semibold text-gray-900">
					일시적인 오류로 <br /> 데이터를 불러올 수 없습니다.
				</h3>
				<p className="text-kor-body2 font-medium text-gray-700">잠시 후 다시 시도해 주세요.</p>
			</div>
		</div>
	);
}
