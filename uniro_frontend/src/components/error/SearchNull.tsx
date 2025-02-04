import NullIcon from "../../assets/error/search-null.svg?react";

export default function SearchNull({ message }: { message: string }) {
	return (
		<div className="w-fit flex flex-col items-center px-[11px] py-[26px] space-y-2">
			<NullIcon />
			<div className="space-y-1 ">
				<h3 className="text-kor-body1 font-medium text-gray-900">검색 결과가 없습니다.</h3>
				<p className="text-kor-body3 font-medium text-gray-700">{message}</p>
			</div>
		</div>
	);
}
