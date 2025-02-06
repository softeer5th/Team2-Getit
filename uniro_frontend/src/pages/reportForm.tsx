import React, { useEffect, useState } from "react";

import { PassableStatus, IssueTypeKey } from "../constant/enum/reportEnum";
import { ReportModeType, ReportFormData } from "../data/types/report";

import { ReportTitle } from "../components/report/reportTitle";
import { ReportDivider } from "../components/report/reportDivider";
import { PrimaryForm } from "../components/report/primaryForm";
import { SecondaryForm } from "../components/report/secondaryForm";
import Button from "../components/customButton";

import useScrollControl from "../hooks/useScrollControl";
import useModal from "../hooks/useModal";
import useUniversityInfo from "../hooks/useUniversityInfo";
import useRedirectUndefined from "../hooks/useRedirectUndefined";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getSingleRouteRisk, postReport } from "../api/route";
import { University } from "../data/types/university";
import { useNavigate } from "react-router";

const ReportForm = () => {
	useScrollControl();

	const navigate = useNavigate();
	const redirectToMap = () => navigate("/map");
	const queryClient = useQueryClient();

	const [disabled, setDisabled] = useState<boolean>(true);

	const [FailModal, isFailOpen, openFail, closeFail] = useModal(redirectToMap);
	const [SuccessModal, isSuccessOpen, openSuccess, closeSuccess] = useModal(redirectToMap);

	const [errorTitle, setErrorTitle] = useState<string>("");

	const { university } = useUniversityInfo();

	useRedirectUndefined<University | undefined>([university]);

	const routeId = 1;

	const { data } = useSuspenseQuery({
		queryKey: ["report", university?.id ?? 1001, routeId],
		queryFn: async () => {
			try {
				const data = await getSingleRouteRisk(university?.id ?? 1001, routeId);
				return data;
			} catch (e) {
				return {
					routeId: -1,
					dangerTypes: [],
					cautionTypes: [],
				};
			}
		},
		retry: 1,
	});

	// 임시 Error 처리
	useEffect(() => {
		if (data.routeId === -1) {
			queryClient.invalidateQueries({ queryKey: ["report", university?.id ?? 1001, routeId] });
			setErrorTitle("존재하지 않은 경로예요");
			openFail();
		}
	}, [data]);

	const [reportMode, setReportMode] = useState<ReportModeType | null>(
		data.cautionTypes.length > 0 || data.dangerTypes.length > 0 ? "update" : "create",
	);

	const [formData, setFormData] = useState<ReportFormData>({
		passableStatus:
			reportMode === "create"
				? PassableStatus.INITIAL
				: data.cautionTypes.length > 0
					? PassableStatus.CAUTION
					: PassableStatus.DANGER,
		dangerIssues: data.dangerTypes,
		cautionIssues: data.cautionTypes,
	});

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
			dangerIssues: status === prev.passableStatus ? prev.dangerIssues : [],
			cautionIssues: status === prev.passableStatus ? prev.cautionIssues : [],
		}));
	};

	const handleSecondarySelect = (answerType: IssueTypeKey) => {
		if (formData.passableStatus === PassableStatus.DANGER) {
			setFormData((prev) => ({
				...prev,
				dangerIssues: prev.dangerIssues.includes(answerType)
					? prev.dangerIssues.filter((issue) => issue !== answerType)
					: [...prev.dangerIssues, answerType],
			}));
		} else if (formData.passableStatus === PassableStatus.CAUTION) {
			setFormData((prev) => ({
				...prev,
				cautionIssues: prev.cautionIssues.includes(answerType)
					? prev.cautionIssues.filter((issue) => issue !== answerType)
					: [...prev.cautionIssues, answerType],
			}));
		}
	};

	const { mutate } = useMutation({
		mutationFn: () =>
			postReport(university?.id ?? 1001, routeId, {
				dangerTypes: formData.dangerIssues,
				cautionTypes: formData.cautionIssues,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["report", university?.id ?? 1001, routeId] });
			openSuccess();
		},
		onError: () => {
			setErrorTitle("제보에 실패하였습니다");
			openFail();
		},
	});

	return (
		<div className="flex flex-col h-svh w-full max-w-[450px] mx-auto relative">
			<ReportTitle reportMode={reportMode!} />
			<ReportDivider />
			<div className="flex-1 overflow-y-auto">
				<PrimaryForm
					reportMode={reportMode!}
					passableStatus={formData.passableStatus}
					handlePrimarySelect={handlePrimarySelect}
				/>
				<SecondaryForm
					reportMode={reportMode!}
					formData={formData}
					handleSecondarySelect={handleSecondarySelect}
				/>
			</div>
			<div className="mb-4 w-full px-4">
				<Button onClick={() => mutate()} variant={disabled ? "disabled" : "primary"}>
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
				<p className="text-kor-body1 font-bold text-system-red">{errorTitle}</p>
				<div className="space-y-0">
					<p className="text-kor-body3 font-regular text-gray-700">
						해당 경로는 다른 사용자에 의해 삭제되어,
					</p>
					<p className="text-kor-body3 font-regular text-gray-700">지도 화면에서 바로 확인할 수 있어요.</p>
				</div>
			</FailModal>
		</div>
	);
};

export default ReportForm;
