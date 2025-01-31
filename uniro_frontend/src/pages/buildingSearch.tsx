import Input from "../components/customInput";
import { hanyangBuildings } from "../data/mock/hanyangBuildings";
import BuildingCard from "../components/building/buildingCard";
import useSearchBuilding from "../hooks/useSearchBuilding";

export default function BuildingSearchPage() {
	const { setBuilding } = useSearchBuilding();
	return (
		<div className="relative flex flex-col h-screen w-full max-w-[450px] mx-auto justify-center">
			<div className="px-[14px] py-4 border-b-[1px] border-gray-400">
				<Input onLengthChange={() => { }} handleVoiceInput={() => { }} placeholder="" />
			</div>
			<div className="flex-1 overflow-y-scroll">
				<ul className="px-4 pt-1 space-y-1">
					{hanyangBuildings.map((building) => (
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
