import React, { useEffect, useState } from "react";

import { PassableStatus, DangerIssueType, CautionIssueType } from "../constant/enum/reportEnum";
import { ReportModeType, ReportFormData } from "../data/types/report";

import { ReportTitle } from "../components/report/reportTitle";
import { ReportDivider } from "../components/report/reportDivider";
import { PrimaryForm } from "../components/report/primaryForm";
import { SecondaryForm } from "../components/report/secondaryForm";
import Button from "../components/customButton";

import useScrollControl from "../hooks/useScrollControl";
import useModal from "../hooks/useModal";
import useReportHazard from "../hooks/useReportHazard";

const ReportForm = () => {
	useScrollControl();

	const [reportMode, setReportMode] = useState<ReportModeType | null>(null);

	const [formData, setFormData] = useState<ReportFormData>({
		passableStatus: PassableStatus.INITIAL,
		dangerIssues: [],
		cautionIssues: [],
	});

	const [disabled, setDisabled] = useState<boolean>(true);

	const [FailModal, isFailOpen, openFail, closeFail] = useModal();
	const [SuccessModal, isSuccessOpen, openSuccess, closeSuccess] = useModal();

	const { reportType, startNode, endNode } = useReportHazard();

	useEffect(() => {
		console.log(reportType, startNode, endNode);

		setTimeout(() => {
			setReportMode("update");
		}, 2000);
	}, []);

	useEffect(() => {
		if (
			formData.passableStatus === PassableStatus.INITIAL ||
			(formData.passableStatus === PassableStatus.DANGER && formData.dangerIssues.length === 0) ||
			(formData.passableStatus === PassableStatus.CAUTION && formData.cautionIssues.length === 0)
		) {
			setDisabled(true);
			return;
		}
		setDisabled(false);
	}, [formData]);

	const handlePrimarySelect = (status: PassableStatus) => {
		setFormData((prev) => ({
			passableStatus: status === prev.passableStatus ? PassableStatus.INITIAL : status,
			dangerIssues: status === PassableStatus.DANGER ? [] : prev.dangerIssues,
			cautionIssues: status === PassableStatus.CAUTION ? [] : prev.cautionIssues,
		}));
	};

	const handleSecondarySelect = (answerType: DangerIssueType | CautionIssueType) => {
		if (formData.passableStatus === PassableStatus.DANGER) {
			setFormData((prev) => ({
				...prev,
				dangerIssues: prev.dangerIssues.includes(answerType as DangerIssueType)
					? prev.dangerIssues.filter((issue) => issue !== answerType)
					: [...prev.dangerIssues, answerType as DangerIssueType],
			}));
		} else if (formData.passableStatus === PassableStatus.CAUTION) {
			setFormData((prev) => ({
				...prev,
				cautionIssues: prev.cautionIssues.includes(answerType as CautionIssueType)
					? prev.cautionIssues.filter((issue) => issue !== answerType)
					: [...prev.cautionIssues, answerType as CautionIssueType],
			}));
		}
	};

	const onReportSubmitSuccess = () => {
		openSuccess();
	};

	const onReportSubmitFail = () => {
		openFail();
	};

	return reportMode ? (
		<div className="flex flex-col h-svh w-full max-w-[450px] mx-auto relative">
			<ReportTitle reportMode={reportMode} />
			<ReportDivider />
			<div className="flex-1 overflow-y-auto">
				<PrimaryForm
					reportMode={reportMode}
					passableStatus={formData.passableStatus}
					handlePrimarySelect={handlePrimarySelect}
				/>
				<SecondaryForm
					reportMode={reportMode}
					formData={formData}
					handleSecondarySelect={handleSecondarySelect}
				/>
			</div>
			<div className="mb-4 w-full px-4">
				<Button onClick={onReportSubmitSuccess} variant={disabled ? "disabled" : "primary"}>
					제보하기
				</Button>
			</div>
			<SuccessModal>
				<p className="text-kor-body1 font-bold text-primary-500">불편한 길 제보를 완료했어요!</p>
				<div className="space-y-0">
					<p className="text-kor-body3 font-regular text-gray-700">제보는 바로 반영되지만,</p>
					<p className="text-kor-body3 font-regular text-gray-700">
						더 정확한 정보를 위해 추후 수정될 수 있어요.
					</p>
				</div>
			</SuccessModal>
			<FailModal>
				<p className="text-kor-body1 font-bold text-system-red">이미 삭제된 경로예요</p>
				<div className="space-y-0">
					<p className="text-kor-body3 font-regular text-gray-700">
						해당 경로는 다른 사용자에 의해 삭제되어,
					</p>
					<p className="text-kor-body3 font-regular text-gray-700">지도 화면에서 바로 확인할 수 있어요.</p>
				</div>
			</FailModal>
		</div>
	) : (
		<div>로딩중...</div>
	);
};

export default ReportForm;
