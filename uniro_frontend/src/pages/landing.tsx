import LandingButton from "../components/landingButton";
import Logo from "../assets/logo.svg?react";
import UNIRO from "../assets/UNIRO.svg?react";
import { Link } from "react-router";
import useRoutePoint from "../hooks/useRoutePoint";
import useUniversityInfo from "../hooks/useUniversityInfo";
import { useEffect } from "react";

export default function LandingPage() {
	const { setUniversity } = useUniversityInfo();
	const { setDestination, setOrigin } = useRoutePoint();

	const initData = () => {
		setDestination(undefined);
		setOrigin(undefined);
		setUniversity(undefined);
	};

	useEffect(() => {
		initData();
	}, []);

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto justify-center bg-[url(/public/background.png)] bg-cover">
			<div>
				<p className="text-kor-heading1 font-bold">어디든 갈 수 있는 캠퍼스.</p>
				<p className="text-kor-heading1 font-bold">쉽고 빠르게 이동하세요.</p>
			</div>
			<div className="w-full absolute bottom-6 left-[50%] px-[14px] translate-x-[-50%] flex flex-col items-start">
				<div className="flex flex-row items-center space-x-[7px] mb-5">
					<Logo />
					<UNIRO />
				</div>
				<Link to="/university" className="w-full">
					<LandingButton />
				</Link>
			</div>
		</div>
	);
}
