import OfflineIcon from "../../assets/error/offline.svg?react";

export default function Offline() {
	return (
		<div className="w-[285px] h-[198px] flex flex-col items-center px-[18px] py-2 space-y-5">
			<OfflineIcon />
			<div className="space-y-[6px]">
				<h3 className="text-kor-heading2 font-semibold text-gray-900">오프라인 상태입니다.</h3>
				<p className="text-kor-body2 font-medium text-gray-700">네트워크에 연결됐는지 확인해 주세요.</p>
			</div>
		</div>
	);
}
