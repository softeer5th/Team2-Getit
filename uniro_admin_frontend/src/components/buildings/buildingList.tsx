import React from "react";
import { Building } from "../../data/types/node";
import BuildingCard from "./buildingCard";

// export interface Node extends Coord {
//   nodeId: NodeId;
// }

// export interface Building extends Node {
//   buildingName: string;
//   buildingImageUrl: string;
//   phoneNumber: string;
//   address: string;
// }

type BuildingListProps = {
  buildings: Building[];
  selectedBuildingId: number | null;
};

const BuildingList = ({ selectedBuildingId, buildings }: BuildingListProps) => {
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-scroll px-1 space-y-2 mb-2 ">
      {buildings &&
        buildings.map((building) => {
          const { nodeId, buildingName } = building;
          return (
            <BuildingCard
              key={building.nodeId}
              isSelected={selectedBuildingId === building.nodeId}
              nodeId={nodeId}
              buildingName={buildingName}
            />
          );
        })}
    </div>
  );
};

export default BuildingList;
