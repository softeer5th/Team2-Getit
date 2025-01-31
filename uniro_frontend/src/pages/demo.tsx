import useModal from "../hooks/useModal";
import Button from "../components/customButton";
import LandingButton from "../components/landingButton";
import Input from "../components/customInput";
import Map from "../component/Map";
import RouteInput from "../components/map/routeSearchInput";
import OriginIcon from "../assets/map/origin.svg?react";
import DestinationIcon from "../assets/map/destination.svg?react";
import { useState } from "react";
import ReportButton from "../components/map/reportButton";
import { CautionToggleButton, DangerToggleButton } from "../components/map/floatingButtons";

export default function Demo() {
	const [FailModal, isFailOpen, openFail, closeFail] = useModal();
	const [SuccessModal, isSuccessOpen, openSuccess, closeSuccess] = useModal();
	const [destination, setDestination] = useState<string>("역사관");

	return (
		<>
			<div className="flex flex-row">
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
			</div>
			<div className="h-[500px] w-[500px]">
				<Map />
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</>
	);
}
