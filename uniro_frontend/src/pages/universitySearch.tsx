import { useEffect, useState } from "react";
import Input from "../components/customInput";
import UniversityButton from "../components/universityButton";
import Button from "../components/customButton";
import { Link } from "react-router";
import useUniversityInfo from "../hooks/useUniversityInfo";
import { useQuery } from "@tanstack/react-query";
import { getUniversityList } from "../api/search";
import { University } from "../data/types/university";
import useRoutePoint from "../hooks/useRoutePoint";

export default function UniversitySearchPage() {
	const [selectedUniv, setSelectedUniv] = useState<University>();
	const { university, setUniversity } = useUniversityInfo();
	const { setDestination, setOrigin } = useRoutePoint();
	const [input, setInput] = useState<string>("");

	const { data: universityList } = useQuery({
		queryKey: ["university", input],
		queryFn: () => getUniversityList(input),
	});

	useEffect(() => {
		if (university) {
			setSelectedUniv(university);
		}
	}, []);

	// 경로가 선택된 상태에서 이 페이지에 들어올 수 있는 가능성은 거의 없지만,
	// Origin과 Destination이 남아있을 가능성을 방어한 코드입니다.
	useEffect(() => {
		setDestination(undefined);
		setOrigin(undefined);
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
