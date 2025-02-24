import { useSuspenseQuery } from "@tanstack/react-query";
import { getSearchBuildings } from "../../api/nodes";
import { University } from "../../types/university";
import useSearchBuilding from "../../hooks/useSearchBuilding";
import BuildingCard from "./buildingCard";
import BuildingNotFound from "./buildingNotFound";

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
		<ul className="w-full h-full px-4 pt-1 space-y-1">
			{buildings.length === 0 ? (
				<BuildingNotFound />
			) : (
				buildings.map((building) => (
					<BuildingCard
						onClick={() => setBuilding(building)}
						key={`building-${building.buildingName}`}
						building={building}
					/>
				))
			)}
		</ul>
	);
}
