import React from "react";

interface LogTitleProps {
	refetch: () => void;
	isFetching: boolean;
}

const LogTitle = ({ refetch, isFetching }: LogTitleProps) => {
	return (
		<div className="flex flex-row justify-between pl-1 text-kor-heading2 py-1 border-b-2 border-gray-200 w-full text-left font-semibold mb-2">
			<p>로그 목록</p>
			<button
				onClick={refetch}
				className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-blue-500 text-white hover:bg-blue-600 mr-2`}
			>
				{isFetching ? "새로고침 중..." : "새로고침"}
			</button>
		</div>
	);
};

export default LogTitle;
