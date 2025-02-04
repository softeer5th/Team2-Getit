import useModal from "../hooks/useModal";
import Button from "../components/customButton";
import LandingButton from "../components/landingButton";
import Input from "../components/customInput";
import Map from "../component/Map";
import RouteInput from "../components/map/routeSearchInput";
import OriginIcon from "../assets/map/origin.svg?react";
import DestinationIcon from "../assets/map/destination.svg?react";
import { useEffect, useState } from "react";
import ReportButton from "../components/map/reportButton";
import { CautionToggleButton, DangerToggleButton } from "../components/map/floatingButtons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getFetch, postFetch, putFetch } from "../utils/fetch/fetch";
import SearchNull from "../components/error/SearchNull";
import Offline from "../components/error/Offline";

const getTest = () => {
	/** https://jsonplaceholder.typicode.com/comments?postId=1 */
	return getFetch<{ postId: string }>("/comments", {
		postId: 1,
	});
};

const postTest = (): Promise<{ id: string }> => {
	return postFetch<{ id: string }, string>("/posts", { id: "test" });
};

const putTest = (): Promise<{ id: string }> => {
	return putFetch<{ id: string }, string>("/posts/1", { id: "test" });
};

export default function Demo() {
	const [FailModal, isFailOpen, openFail, closeFail] = useModal();
	const [SuccessModal, isSuccessOpen, openSuccess, closeSuccess] = useModal();
	const [destination, setDestination] = useState<string>("역사관");

	const { data, status } = useQuery({
		queryKey: ["test"],
		queryFn: getTest,
	});

	const { data: postData, mutate: mutatePost } = useMutation<{ id: string }>({
		mutationFn: postTest,
	});

	const { data: putData, mutate: mutatePut } = useMutation<{ id: string }>({
		mutationFn: putTest,
	});

	useEffect(() => {
		console.log(data);
	}, [status]);

	return (
		<>
			<div className="flex flex-row flex-wrap">
				<div className="w-1/3 flex flex-col justify-start space-y-5 p-5 mb-5 rounded-sm border border-dashed border-[#9747FF] ">
					<Button onClick={openFail}>버튼</Button>
					<Button onClick={openSuccess} variant="secondary">
						버튼
					</Button>
					<Button variant="disabled">버튼</Button>

					<LandingButton />
				</div>

				<div className="w-1/3 flex flex-col justify-start space-y-5 p-5 mb-5 rounded-sm border border-dashed border-[#9747FF] ">
					<ReportButton />
					<div className="flex space-x-3 rounded-sm border border-dashed border-[#9747FF] p-3">
						<DangerToggleButton onClick={() => { }} isActive={false} />
						<DangerToggleButton onClick={() => { }} isActive={true} />
					</div>

					<div className="flex space-x-3 rounded-sm border border-dashed border-[#9747FF] p-3">
						<CautionToggleButton onClick={() => { }} isActive={false} />
						<CautionToggleButton onClick={() => { }} isActive={true} />
					</div>
				</div>

				<div className="w-1/3 rounded-sm border border-dashed border-[#9747FF] flex flex-col justify-start space-y-5 p-5">
					<Input
						placeholder="우리 학교를 검색해보세요"
						handleVoiceInput={() => { }}
						onLengthChange={(e: string) => {
							console.log(e);
						}}
					/>
					<RouteInput onClick={() => { }} placeholder="출발지를 입력하세요">
						<OriginIcon />
					</RouteInput>

					<RouteInput
						onClick={() => { }}
						placeholder="도착지를 입력하세요"
						value={destination}
						onCancel={() => setDestination("")}
					>
						<DestinationIcon />
					</RouteInput>
				</div>
				<SuccessModal>
					<p className="text-kor-body1 font-bold text-primary-500">불편한 길 제보가 완료되었습니다!</p>
					<div className="space-y-0">
						<p className="text-kor-body3 font-regular text-gray-700">제보해주셔서 감사합니다.</p>
						<p className="text-kor-body3 font-regular text-gray-700">
							관리자 검토 후 반영되니 조금만 기다려주세요.
						</p>
					</div>
				</SuccessModal>
				<FailModal>
					<p className="text-kor-body1 font-bold text-system-red">경로를 찾을 수 없습니다</p>
					<div className="space-y-0">
						<p className="text-kor-body3 font-regular text-gray-700">
							해당 경로에는 배리어프리한 길이 없습니다.
						</p>
						<p className="text-kor-body3 font-regular text-gray-700">다른 건물을 시도해주세요.</p>
					</div>
				</FailModal>
				<div className="w-1/2 h-[500px] rounded-sm border border-dashed border-[#9747FF]">
					<Map />
				</div>
				<div className="w-1/2 rounded-sm border border-dashed border-[#9747FF] flex flex-row flex-wrap justify-start space-y-5 p-5">
					<Button onClick={() => mutatePost()}>
						{postData?.id ? `${postData.id} : 테스트 결과` : "POST 테스트"}
					</Button>
					<Button onClick={() => mutatePut()}>
						{putData?.id ? `${putData.id} : 테스트 결과` : "PUT 테스트"}
					</Button>
					<div className="w-fit h-fit rounded-sm border border-dashed border-[#9747FF] p-5">
						<SearchNull message="캠퍼스 내 건물명을 입력해 보세요." />
						<SearchNull message="캠퍼스 리스트를 확인해 보세요." />
					</div>
					<div className="w-fit h-fit rounded-sm border border-dashed border-[#9747FF] p-5">
						<Offline />
					</div>
				</div>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</>
	);
}
