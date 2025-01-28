import React from "react";
import TopBar from "../components/topBar";
import Map from "../component/Map";
import Button from "../components/customButton";

const RouteResultPage = () => {
	// TODO: Svh 변경사항 알려주기
	return (
		<div className="h-svh w-full max-w-[450px] flex flex-col items-center">
			<TopBar />
			<Map />
			<div className="absolute bottom-0 w-full pb-[30px] px-4">
				<Button>상세경로 보기</Button>
			</div>
		</div>
	);
};

export default RouteResultPage;
