import React from "react";
import useUniversityInfo from "../../hooks/useUniversityInfo";
type Props = {
	isLoading: boolean;
	loadingContent?: string;
};
const Loading = ({ isLoading, loadingContent }: Props) => {
	const { university } = useUniversityInfo();

	if (!isLoading) return null;

	return (
		<div
			className="fixed inset-0 flex flex-col items-center justify-center w-full mx-auto bg-white 
					bg-[url(/public/loading/background.svg)] bg-no-repeat bg-center bg-contain z-50"
		>
			{university && (
				<div className="flex flex-row items-center justify-center bg-white rounded-3xl space-x-1">
					<img src={university?.imageUrl} className="h-4 w-4 ml-2 my-2" />
					<p className="text-kor-body2 mr-2 my-1">{university?.name}</p>
				</div>
			)}
			<p className="text-kor-body2 mt-3">{university ? loadingContent : "로딩중입니다."}</p>
			<img src="/loading/spinner.svg" className="w-12 h-12 mt-8 spinner" />
		</div>
	);
};

export default Loading;
