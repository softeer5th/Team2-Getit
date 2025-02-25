import { PassableStatus } from "../../constant/enum/reportEnum";
import { ReportModeType } from "../../types/report";

type FormTitleProps = {
	isPrimary: boolean;
	reportMode: ReportModeType;
	passableStatus: PassableStatus;
};

const createTitleString = ({ isPrimary, reportMode, passableStatus }: FormTitleProps) => {
	const mainTitle = isPrimary
		? "통행 가능 여부"
		: `통행 ${passableStatus === PassableStatus.DANGER ? "불가" : "주의"} 불편 요소 선택`;
	const subTitle = isPrimary
		? "통행 불가능한 길은 추천 여부에서 제외됩니다."
		: `불편했던 요소를 ${reportMode === "create" ? "선택" : "수정"}해주세요.`;
	return { mainTitle, subTitle };
};

export const FormTitle = ({ isPrimary, reportMode, passableStatus }: FormTitleProps) => {
	const { mainTitle, subTitle } = createTitleString({ isPrimary, reportMode, passableStatus });
	return (
		<div className="flex flex-col w-full items-start justify-center space-y-[2px] mt-6 ml-6">
			<div className="text-gray-900 text-left font-medium text-kor-body2">{mainTitle}</div>
			<div className="text-gray-700 text-left text-kor-body3 text-[15px] whitespace-pre-wrap">{subTitle}</div>
		</div>
	);
};
