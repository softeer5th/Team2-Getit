import React from "react";
import { Building } from "../../data/types/node";
import BuildingCard from "./buildingCard";
import { Coord } from "../../data/types/coord";

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
  setCenterToCoordinate: (nodeId: number, coord: Coord) => void;
};

const BuildingList = ({
  selectedBuildingId,
  buildings,
  setCenterToCoordinate,
}: BuildingListProps) => {
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-scroll px-1 space-y-2 mb-2 ">
      {buildings &&
        buildings.map((building) => {
          const { nodeId, buildingName } = building;
          return (
            <BuildingCard
              key={nodeId}
              onClick={() =>
                setCenterToCoordinate(nodeId, {
                  lat: building.lat,
                  lng: building.lng,
                })
              }
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
