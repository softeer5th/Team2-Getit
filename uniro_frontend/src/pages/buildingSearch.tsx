import Input from "../components/customInput";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { Suspense, useState } from "react";
import CloseIcon from "../assets/icon/close.svg?react";
import { useNavigate } from "react-router";
import BuildingList from "../components/building/buildingList";
import InnerLoading from "../components/loading/innerLoading";

export default function BuildingSearchPage() {
	const { university } = useUniversityInfo();
	const navigate = useNavigate();

	if (!university) return null;

	const [input, setInput] = useState("");

	const handleBack = () => {
		navigate(-1);
	};

	useRedirectUndefined([university]);

	return (
		<div className="relative flex flex-col h-dvh w-full mx-auto justify-center">
			<div className="flex flex-row px-[14px] py-4 border-b-[1px] border-gray-400 gap-2">
				<Input onChangeDebounce={(e) => setInput(e)} placeholder="" />
				<button onClick={handleBack} className="cursor-pointer p-1 rounded-[8px] active:bg-gray-200">
					<CloseIcon />
				</button>
			</div>
			<div className="flex-1 overflow-y-scroll">
				<Suspense fallback={<InnerLoading isLoading={true} loadingContent="검색 중 입니다" />}>
					<BuildingList university={university} input={input} />
				</Suspense>
			</div>
		</div>
	);
}
