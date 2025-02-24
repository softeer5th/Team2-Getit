import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import React, { MouseEvent, Dispatch, SetStateAction } from "react";
import { getUniversityList } from "../../api/search";
import UniversityButton from "../universityButton";
import { University } from "../../types/university";
import { useNavigate } from "react-router";
import useUniversityInfo from "../../hooks/useUniversityInfo";
import UniversityNotFound from "./universityNotFound";

interface UniveristyListProps {
	query: string;
	selectedUniv: University | undefined;
	setSelectedUniv: Dispatch<SetStateAction<University | undefined>>;
}

export default function UniversityList({ query, selectedUniv, setSelectedUniv }: UniveristyListProps) {
	const { data: universityList } = useSuspenseQuery({
		queryKey: ["university", query],
		queryFn: () => getUniversityList(query),
	});
	const { university, setUniversity } = useUniversityInfo();
	const navigation = useNavigate();

	const handleClick = (e: MouseEvent<HTMLButtonElement>, univ: University) => {
		setSelectedUniv(univ);
	};

	const handleDbClick = (e: MouseEvent<HTMLButtonElement>, univ: University) => {
		setSelectedUniv(univ);
		setUniversity(univ);
		navigation("/map");
	};

	return (
		<ul className="w-full h-full py-[6px]">
			{universityList.length === 0 ? (
				<UniversityNotFound />
			) : (
				universityList.map((univ) => (
					<UniversityButton
						key={`university-${univ.id}`}
						selected={selectedUniv?.id === univ.id}
						onClick={handleClick}
						onDbClick={handleDbClick}
						university={univ}
					/>
				))
			)}
		</ul>
	);
}
