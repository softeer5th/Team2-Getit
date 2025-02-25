import { Suspense, useEffect, useState } from "react";
import Input from "../components/customInput";
import Button from "../components/customButton";
import { Link } from "react-router";
import useUniversityInfo from "../hooks/useUniversityInfo";
import { University } from "../types/university";
import useRoutePoint from "../hooks/useRoutePoint";
import UniversityList from "../components/university/universityList";
import InnerLoading from "../components/loading/innerLoading";

export default function UniversitySearchPage() {
	const [selectedUniv, setSelectedUniv] = useState<University>();
	const { university, setUniversity } = useUniversityInfo();
	const { setDestination, setOrigin } = useRoutePoint();
	const [input, setInput] = useState<string>("");

	useEffect(() => {
		if (university) {
			setSelectedUniv(university);
		}
	}, []);

	// 경로가 선택된 상태에서 이 페이지에 들어올 수 있는 가능성은 거의 없지만,
	// Origin과 Destination이 남아있을 가능성을 방어한 코드입니다.
	useEffect(() => {
		setDestination(undefined);
		setOrigin(undefined);
	}, []);

	return (
		<div className="h-full w-full" onClick={() => setSelectedUniv(undefined)}>
			<div className="relative flex flex-col h-dvh w-full  mx-auto py-5">
				<div className="w-full px-[14px] pb-[17px] border-b-[1px] border-gray-400">
					<Input onChangeDebounce={(e) => setInput(e)} placeholder="우리 학교를 검색해보세요" />
				</div>
				<div className="overflow-y-scroll flex-1 max-w-[450px] w-full mx-auto px-[14px]">
					<Suspense
						fallback={<InnerLoading isLoading={true} loadingContent="학교 목록을 불러오고 있습니다." />}
					>
						<UniversityList query={input} selectedUniv={selectedUniv} setSelectedUniv={setSelectedUniv} />
					</Suspense>
				</div>
				<div className="max-w-[450px] mx-auto w-full px-[14px]">
					{selectedUniv && (
						<Link to="/map" onClick={() => setUniversity(selectedUniv)}>
							<Button variant="primary">다음</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
