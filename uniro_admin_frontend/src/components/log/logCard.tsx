import { Dispatch, SetStateAction } from "react";
import { RevisionType } from "../../data/types/revision";

interface LogCardProps {
	version: RevisionType;
	isSelected: boolean;
	setSelect: Dispatch<SetStateAction<RevisionType>>;
}

export const LogCard = ({ isSelected, setSelect, version }: LogCardProps) => {
	const { rev, revTime } = version;

	return (
		<div
			onClick={() => setSelect(version)}
			className={`flex flex-col rounded-100 border-[1px] border-gray-300 shadow-2xs items-center justify-center w-full py-1 px-2 text-kor-body2 text-left  hover:bg-gray-700 hover:text-white transition-colors ${isSelected && "bg-gray-700 text-white"}`}
		>
			<h2 className="w-full font-bold">버전 ID : {rev}</h2>
			<p className="w-full text-sm">수정일자 : {revTime}</p>
		</div>
	);
};

export default LogCard;
