import { ButtonHTMLAttributes } from "react";
import ChevronRight from "../../public/icons/chevron-right.svg?react";

export default function LandingButton({ ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			{...rest}
			className={`w-full h-[58px] max-w-[450px] flex flex-row items-center justify-between px-[24px] font-semibold text-kor-body1 rounded-300 cursor-pointer bg-primary-500 text-gray-100 active:bg-primary-600`}
		>
			우리 학교 찾기
			<ChevronRight fill="none" stroke="#FFFFFF" />
		</button>
	);
}
