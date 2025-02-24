import React, { Dispatch } from "react";
import BottomCard from "./bottomCard";
import { NavigationButtonRouteType, NavigationRouteListRecord } from "../../../types/route";

type Props = {
	routeList: NavigationRouteListRecord;
	buttonType: NavigationButtonRouteType;
	showDetailView: () => void;
	setButtonState: Dispatch<NavigationButtonRouteType>;
};

const BottomCardList = ({ routeList, buttonType = "PEDES & SAFE", showDetailView, setButtonState }: Props) => {
	if (buttonType === "PEDES & SAFE") {
		const routeInfo = routeList[buttonType];
		const { totalCost, totalDistance } = routeInfo;
		return (
			<div className="w-full flex flex-row items-center justify-center gap-4 px-4">
				<BottomCard
					type="normal"
					onClick={showDetailView}
					routeInfo={{ totalCost, totalDistance }}
					selected={buttonType === "PEDES & SAFE"}
				/>
			</div>
		);
	}

	const keyExists = (key: NavigationButtonRouteType) => {
		return routeList[key] !== undefined;
	};

	return (
		<div className="w-full flex flex-row items-center justify-center gap-4 px-4">
			<BottomCard
				type="caution"
				selected={buttonType.includes("CAUTION")}
				onClick={
					keyExists("MANUAL & CAUTION") || keyExists("ELECTRIC & CAUTION")
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
					keyExists("MANUAL & CAUTION") || keyExists("ELECTRIC & CAUTION")
						? {
								totalCost: buttonType.includes("MANUAL")
									? routeList["MANUAL & CAUTION"]?.totalCost
									: routeList["ELECTRIC & CAUTION"]?.totalCost,
								totalDistance: buttonType.includes("MANUAL")
									? routeList["MANUAL & CAUTION"]?.totalDistance
									: routeList["ELECTRIC & CAUTION"]?.totalDistance,
							}
						: undefined
				}
			/>
			<BottomCard
				type="safe"
				selected={buttonType.includes("SAFE")}
				onClick={
					keyExists("MANUAL & SAFE") || keyExists("ELECTRIC & SAFE")
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
					routeList[buttonType]
						? {
								totalCost: buttonType.includes("MANUAL")
									? routeList["MANUAL & SAFE"]?.totalCost
									: routeList["ELECTRIC & SAFE"]?.totalCost,
								totalDistance: buttonType.includes("MANUAL")
									? routeList["MANUAL & SAFE"]?.totalDistance
									: routeList["ELECTRIC & SAFE"]?.totalDistance,
							}
						: undefined
				}
			/>
		</div>
	);
};

export default BottomCardList;
