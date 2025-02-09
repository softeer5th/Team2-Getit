import React from "react";
import BuildingListTitle from "../../components/buildings/buildingListTitle";
import BuildingList from "../../components/buildings/buildingList";

const BuildingListContainer = () => {
  return (
    <div className="flex flex-col items-start w-1/5 border-x-2 border-gray-300 h-full">
      <BuildingListTitle />
      <BuildingList />
    </div>
  );
};

export default BuildingListContainer;
