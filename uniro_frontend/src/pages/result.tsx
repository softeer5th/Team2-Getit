import React, { useState } from "react";
import TopBar from "../components/topBar";
import Map from "../component/Map";
import Button from "../components/customButton";
import { useNavigate } from "react-router";
import useScrollControl from "../hooks/useScrollControl";
import { AnimatePresence, motion } from "framer-motion";

const RouteResultPage = () => {
	useScrollControl();
	const [isVisible, setIsVisible] = useState(true);
	const navigate = useNavigate();

	const handleClick = () => {
		setIsVisible(false);
		setTimeout(() => {
			navigate("/result/detail");
		}, 300);
	};

	return (
		<div className="relative h-svh w-full max-w-[450px] mx-auto ">
			<TopBar />
			<Map />
			<AnimatePresence>
				{isVisible && (
					<motion.div
						className="absolute bottom-0 left-0 w-full mb-[30px] px-4"
						initial={{ bottom: -88 }}
						animate={{ bottom: 0 }}
						exit={{ bottom: -88 }}
						transition={{ duration: 0.3 }}
					>
						<Button onClick={handleClick}>상세경로 보기</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default RouteResultPage;
