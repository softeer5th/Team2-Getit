import { useSuspenseQuery } from "@tanstack/react-query";
import { getSearchBuildings } from "../../api/nodes";
import { University } from "../../data/types/university";
import useSearchBuilding from "../../hooks/useSearchBuilding";
import BuildingCard from "./buildingCard";

interface BuildingListProps {
	university: University;
	input: string;
}

export default function BuildingList({ university, input }: BuildingListProps) {
	const { setBuilding } = useSearchBuilding();

	const { data: buildings } = useSuspenseQuery({
		queryKey: [university.id, "buildings", input],
		queryFn: () => getSearchBuildings(university.id, { name: input.replace(" ", ""), "page-size": 50 }),
	});

	return (
		<ul className="px-4 pt-1 space-y-1">
			{(buildings ?? []).map((building) => (
				<BuildingCard
					onClick={() => setBuilding(building)}
					key={`building-${building.buildingName}`}
					building={building}
				/>
			))}
		</ul>
	);
}
