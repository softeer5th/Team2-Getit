import Input from "../components/customInput";
import { hanyangBuildings } from "../data/mock/hanyangBuildings";
import BuildingCard from "../components/building/buildingCard";
import useSearchBuilding from "../hooks/useSearchBuilding";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { useQuery } from "@tanstack/react-query";
import { getAllBuildings } from "../api/nodes";
import { University } from "../data/types/university";

export default function BuildingSearchPage() {
	const { university } = useUniversityInfo();
	const { setBuilding } = useSearchBuilding();

	if (!university) return;

	const { data: buildings } = useQuery({
		queryKey: [university.id, "buildings"],
		queryFn: () =>
			getAllBuildings(university.id, {
				leftUpLat: 38,
				leftUpLng: 127,
				rightDownLat: 37,
				rightDownLng: 128,
			}),
	},)

	useRedirectUndefined<University | undefined>([university]);

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto justify-center">
			<div className="px-[14px] py-4 border-b-[1px] border-gray-400">
				<Input onLengthChange={() => { }} handleVoiceInput={() => { }} placeholder="" />
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
