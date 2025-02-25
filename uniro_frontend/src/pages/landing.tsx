import LandingButton from "../components/landingButton";
import UNIRO from "../assets/UNIRO.svg?react";
import { Link, useNavigate } from "react-router";
import useRoutePoint from "../hooks/useRoutePoint";
import useUniversityInfo from "../hooks/useUniversityInfo";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
	const { setUniversity } = useUniversityInfo();
	const { setDestination, setOrigin } = useRoutePoint();
	const navigate = useNavigate();

	const initData = () => {
		setDestination(undefined);
		setOrigin(undefined);
		setUniversity(undefined);
	};

	useEffect(() => {
		initData();
	}, []);

	return (
		<div
			className="relative flex flex-col h-dvh w-full mx-auto justify-center bg-[url(/public/background.webp)] bg-contain"
			onClick={() => navigate("/university")}
		>
			<motion.p
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
				className="text-kor-heading1 font-bold"
			>
				어디든 갈 수 있는 캠퍼스.
			</motion.p>
			<motion.p
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.8, ease: "easeInOut" }}
				className="text-kor-heading1 font-bold"
			>
				쉽고 빠르게 이동하세요.
			</motion.p>
			<div className="w-full max-w-[450px] absolute bottom-6 left-[50%] px-[14px] translate-x-[-50%] flex flex-col items-start">
				<div className="flex flex-row items-center space-x-[7px] mb-5">
					<img src="/logo.webp" className="w-8 h-8"></img>
					<UNIRO />
				</div>
				<Link to="/university" className="w-full">
					<LandingButton />
				</Link>
			</div>
		</div>
	);
}
