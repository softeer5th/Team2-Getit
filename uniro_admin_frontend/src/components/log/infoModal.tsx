import { CautionIssue, DangerIssue } from "../../constant/enum/reportEnum";
import { ChangedInfo } from "../../container/mapContainer";

export default function InfoModal({
	info,
	onClose,
	rev,
	freshRev,
}: {
	info: ChangedInfo;
	onClose: () => void;
	rev: number;
	freshRev: number;
}) {
	return (
		<div className="w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
			<div className="w-[500px] h-[400px] bg-gray-100 rounded-200 p-5 space-y-4 flex flex-col justify-center">
				<h2 className="font-bold text-xl text-primary-500 ">위험 주의 요소 변경사항.</h2>
				<div className="relative flex flex-row flex-1">
					<div className="w-1/2 space-y-5 border-r-1 border-gray-400">
						<h2 className="text-lg font-bold">선택된 버전 v{rev}</h2>
						{info!.difference.cautionFactors.length + info!.difference.dangerFactors.length === 0 ? (
							<>
								<div>
									<h3 className="text-base font-semibold text-mint-500">안전한 길</h3>
								</div>
							</>
						) : (
							<>
								<div>
									<h3 className="text-base font-semibold text-system-orange">주의 요소</h3>
									{info!.difference.cautionFactors.map((el) => (
										<p className="text-sm">{CautionIssue[el]}</p>
									))}
								</div>
								<div>
									<h3 className="text-base font-semibold text-system-red">위험 요소</h3>
									{info!.difference.dangerFactors.map((el) => (
										<p className="text-sm">{DangerIssue[el]}</p>
									))}
								</div>
							</>
						)}
					</div>
					<div className="w-1/2 space-y-5 ">
						<h2 className="text-lg font-bold">최신 버전 v{freshRev}</h2>
						{info!.current.cautionFactors.length + info!.current.dangerFactors.length === 0 ? (
							<>
								<div>
									<h3 className="text-base font-semibold text-mint-500">안전한 길</h3>
								</div>
							</>
						) : (
							<>
								<div>
									<h3 className="text-base font-semibold text-system-orange">주의 요소</h3>
									{info!.current.cautionFactors.map((el) => (
										<p className="text-sm">{CautionIssue[el]}</p>
									))}
								</div>
								<div>
									<h3 className="text-base font-semibold text-system-red">위험 요소</h3>
									{info!.current.dangerFactors.map((el) => (
										<p className="text-sm">{DangerIssue[el]}</p>
									))}
								</div>
							</>
						)}
					</div>
				</div>
				<div className="w-full flex justify-around ">
					<button
						className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-system-red"
						onClick={onClose}
					>
						확인
					</button>
				</div>
			</div>
		</div>
	);
}
