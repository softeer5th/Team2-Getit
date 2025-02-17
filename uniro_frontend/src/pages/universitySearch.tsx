import { useEffect, useState } from "react";
import Input from "../components/customInput";
import UniversityButton from "../components/universityButton";
import Button from "../components/customButton";
import { Link } from "react-router";
import useUniversityInfo from "../hooks/useUniversityInfo";
import { useQuery } from "@tanstack/react-query";
import { getUniversityList } from "../api/search";
import { University } from "../data/types/university";

export default function UniversitySearchPage() {
	const [selectedUniv, setSelectedUniv] = useState<University>();
	const { university, setUniversity } = useUniversityInfo();
	const [input, setInput] = useState<string>("");

	const { data: universityList, status } = useQuery({
		queryKey: ["university", input],
		queryFn: () => getUniversityList(input),
	});

	useEffect(() => {
		if (university) {
			setSelectedUniv(university);
		}
	}, []);

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto py-5">
			<div className="w-full px-[14px] pb-[17px] border-b-[1px] border-gray-400">
				<Input
					onChangeDebounce={(e) => setInput(e)}
					placeholder="우리 학교를 검색해보세요"
					handleVoiceInput={() => {}}
				/>
			</div>
			<div className="overflow-y-scroll flex-1">
				<ul
					className="w-full h-full px-[14px] py-[6px]"
					onClick={() => {
						setSelectedUniv(undefined);
					}}
				>
					{universityList &&
						universityList.map((univ) => (
							<UniversityButton
								key={`university-${univ.id}`}
								selected={selectedUniv?.id === univ.id}
								onClick={() => {
									setSelectedUniv(univ);
								}}
								name={univ.name}
								img={univ.imageUrl}
							/>
						))}
				</ul>
			</div>
			<div className="px-[14px]">
				{selectedUniv && (
					<Link to="/map" onClick={() => setUniversity(selectedUniv)}>
						<Button variant="primary">다음</Button>
					</Link>
				)}
			</div>
		</div>
	);
}
