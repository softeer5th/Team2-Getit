import { Dispatch, SetStateAction, useEffect } from "react";
import LogCard from "./logCard";
import { RevisionType } from "../../data/types/revision";

interface LogListProps {
	selected: RevisionType;
	setSelect: Dispatch<SetStateAction<RevisionType>>;
	revisions: RevisionType[];
	isFetching: boolean;
}

const LogList = ({ selected, revisions, setSelect, isFetching }: LogListProps) => {
	return (
		<div className="relative flex-1 flex flex-col w-full h-full overflow-y-hidden ">
			{isFetching && <div className="w-full h-full absolute bg-[rgba(0,0,0,0.5)]" />}
			<div className="overflow-y-scroll  px-1 mb-2 space-y-2">
				{revisions.map((revision) => {
					return (
						<LogCard setSelect={setSelect} isSelected={selected.rev === revision.rev} version={revision} />
					);
				})}
			</div>
		</div>
	);
};

export default LogList;
