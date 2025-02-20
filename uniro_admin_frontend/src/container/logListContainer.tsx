import React, { Dispatch, SetStateAction } from "react";
import LogTitle from "../components/log/logTitle";
import LogList from "../components/log/logList";
import { RevisionType } from "../data/types/revision";

interface LogListContainerProps {
	isVersionsFetching: boolean;
	selected: RevisionType;
	revisions: RevisionType[] | undefined;
	isFetching: boolean;
	setSelect: Dispatch<SetStateAction<RevisionType>>;
	refetch: () => void;
}

const LogListContainer = ({
	setSelect,
	selected,
	revisions,
	isFetching,
	isVersionsFetching,
	refetch,
}: LogListContainerProps) => {
	return (
		<div className="flex flex-col items-start h-full w-1/5 border-x-2 border-gray-300 h-full">
			<LogTitle isFetching={isVersionsFetching} refetch={refetch} />
			{!revisions || isFetching ? (
				<div className="flex-1 flex flex-col w-full h-full overflow-y-scroll px-1 space-y-2 mb-2 ">
					loading...
				</div>
			) : (
				<LogList setSelect={setSelect} selected={selected} revisions={revisions} />
			)}
		</div>
	);
};

export default LogListContainer;
