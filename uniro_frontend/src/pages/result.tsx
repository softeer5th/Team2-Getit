import React, { useEffect } from "react";
import TopBar from "../components/topBar";
import Map from "../component/Map";
import Button from "../components/customButton";
import { Link, useNavigate } from "react-router";
import useScrollControl from "../hooks/useScrollControl";

const RouteResultPage = () => {

	useScrollControl();

	// TODO: Svh 변경사항 알려주기

	return (
		<div className="relative h-svh w-full max-w-[450px] mx-auto ">
			<TopBar />
			<Map />
			<Link to={'/result/detail'} className="absolute bottom-0 left-0  w-full mb-[30px] px-4">
				<Button>상세경로 보기</Button>
			</Link>
		</div>
	);
};

export default RouteResultPage;
