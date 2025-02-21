import Input from "../components/customInput";
import BuildingCard from "../components/building/buildingCard";
import useSearchBuilding from "../hooks/useSearchBuilding";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { useQuery } from "@tanstack/react-query";
import { getAllBuildings, getSearchBuildings } from "../api/nodes";
import { University } from "../data/types/university";
import { useState } from "react";
import CloseIcon from "../assets/icon/close.svg?react";
import { useNavigate } from "react-router";

export default function BuildingSearchPage() {
	const { university } = useUniversityInfo();
	const { setBuilding } = useSearchBuilding();
	const navigate = useNavigate();

	if (!university) return;

	const [input, setInput] = useState<string>("");

	const { data: buildings } = useQuery({
		queryKey: [university.id, "buildings", input],
		queryFn: () => getSearchBuildings(university.id, { name: input, "page-size": 50 }),
	});

	const handleBack = () => {
		navigate(-1);
	};

	useRedirectUndefined<University | undefined>([university]);

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto justify-center">
			<div className="flex flex-row px-[14px] py-4 border-b-[1px] border-gray-400 ">
				<Input onChangeDebounce={(e) => setInput(e)} handleVoiceInput={() => {}} placeholder="" />
				<button onClick={handleBack} className="cursor-pointer p-1 rounded-[8px] active:bg-gray-200">
					<CloseIcon />
				</button>
			</div>
			<div className="flex-1 overflow-y-scroll">
				<ul className="px-4 pt-1 space-y-1">
					{(buildings ?? []).map((building) => (
						<BuildingCard
							onClick={() => setBuilding(building)}
							key={`building-${building.buildingName}`}
							building={building}
						/>
					))}
				</ul>
			</div>
		</div>
	);
}
