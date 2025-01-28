import React, { useRef } from "react";
import Map from "../component/Map";

type Props = {};

const DetailResultPage = () => {
	return (
		<div className="h-svh w-full max-w-[450px] flex flex-col items-center">
			<Map />
		</div>
	);
};

export default DetailResultPage;
