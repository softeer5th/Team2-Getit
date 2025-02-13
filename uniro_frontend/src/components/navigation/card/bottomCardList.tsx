import React, { Dispatch } from "react";
import BottomCard from "./bottomCard";
import { NavigationButtonRouteType, NavigationRouteList } from "../../../data/types/route";
import { b } from "framer-motion/client";

type Props = {
	routeList: NavigationRouteList[];
	dataLength: number;
	buttonType: NavigationButtonRouteType;
	showDetailView: () => void;
	setButtonState: Dispatch<NavigationButtonRouteType>;
};

const BottomCardList = ({ routeList, buttonType = "PEDES & SAFE", showDetailView, setButtonState }: Props) => {
	if (buttonType === "PEDES & SAFE") {
		const routeInfo = routeList[0];
		const { totalCost, totalDistance } = routeInfo;
		return (
			<div className="w-full flex flex-row items-center justify-center gap-4">
				<BottomCard
					type="normal"
					onClick={showDetailView}
					routeInfo={{ totalCost, totalDistance }}
					selected={buttonType === "PEDES & SAFE"}
				/>
			</div>
		);
	}

	const cautionRoute = routeList.length >= 1 ? routeList[0] : null;
	const safeRoute = routeList.length === 2 ? routeList[1] : null;

	return (
		<div className="w-full flex flex-row items-center justify-center gap-4">
			<BottomCard
				type="caution"
				selected={buttonType.includes("CAUTION")}
				onClick={
					cautionRoute
						? () => {
								if (buttonType.includes("CAUTION")) {
									showDetailView();
								} else {
									setButtonState(
										buttonType.replace(
											"SAFE",
											"CAUTION",
										) as `${NavigationButtonRouteType} & CAUTION`,
									);
								}
							}
						: () => {}
				}
				routeInfo={
					cautionRoute
						? { totalCost: cautionRoute.totalCost, totalDistance: cautionRoute.totalDistance }
						: undefined
				}
			/>
			<BottomCard
				type="safe"
				selected={buttonType.includes("SAFE")}
				onClick={
					safeRoute
						? () => {
								if (buttonType.includes("SAFE")) {
									showDetailView();
								} else {
									setButtonState(
										buttonType.replace("CAUTION", "SAFE") as `${NavigationButtonRouteType} & SAFE`,
									);
								}
							}
						: () => {}
				}
				routeInfo={
					safeRoute ? { totalCost: safeRoute.totalCost, totalDistance: safeRoute.totalDistance } : undefined
				}
			/>
		</div>
	);
};

export default BottomCardList;
