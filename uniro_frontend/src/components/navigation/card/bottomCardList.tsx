import React from "react";
import BottomCard from "./bottomCard";
import { RouteType } from "../../../data/types/route";

type Props = {
	selected: RouteType;
};

const BottomCardList = ({ selcted = "caution" }) => {
	return (
		<div className="w-full flex flex-row items-center justify-center gap-4">
			<BottomCard type="caution" selected={selcted === "caution"}></BottomCard>
			<BottomCard type="safe" selected={selcted === "safe"}></BottomCard>
		</div>
	);
};

export default BottomCardList;
