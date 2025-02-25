import React from "react";

type Props = {
	isLoading: boolean;
	loadingContent?: string;
};

const InnerLoading = ({ isLoading, loadingContent = "로딩중입니다." }: Props) => {
	if (!isLoading) return null;

	return (
		<div
			className="flex flex-col items-center justify-center h-full w-full  mx-auto bg-white 
					z-5"
		>
			<p className="text-kor-body2 mt-3">{loadingContent}</p>
			<img src="/loading/spinner.svg" className="w-12 h-12 mt-8 spinner" />
		</div>
	);
};

export default InnerLoading;
