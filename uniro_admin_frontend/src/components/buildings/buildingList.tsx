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

const buildingMockData: Building[] = [
  {
    nodeId: 1,
    buildingName: "Building 1",
    buildingImageUrl: "https://via.placeholder.com/150",
    phoneNumber: "123-456-7890",
    address: "1234 Main St, City, State 12345",
  },
  {
    nodeId: 2,
    buildingName: "Building 2",
    buildingImageUrl: "https://via.placeholder.com/150",
    phoneNumber: "123-456-7890",
    address: "1234 Main St, City, State 12345",
  },
  {
    nodeId: 3,
    buildingName: "Building 3",
    buildingImageUrl: "https://via.placeholder.com/150",
    phoneNumber: "123-456-7890",
    address: "1234 Main St, City, State 12345",
  },
];

const BuildingList = () => {
  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-scroll px-1 space-y-2 mb-2 ">
      {buildingMockData.map((building) => {
        return (
          <BuildingCard
            key={building.nodeId}
            buildingName={building.buildingName}
          />
        );
      })}
    </div>
  );
};

export default BuildingList;
