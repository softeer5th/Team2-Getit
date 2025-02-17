import DangerIcon from "../../assets/danger.svg?react";
import CautionIcon from "../../assets/caution.svg?react";
import UndoIcon from "../../assets/undo.svg?react";
import ReportIcon from "../../assets/report.svg?react";
import { ButtonHTMLAttributes } from "react";


interface ToggleButtonProps {
	isActive: boolean;
	onClick: () => void;
}

export function DangerToggleButton({ isActive, onClick }: ToggleButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`w-fit h-fit p-[14px] flex shadow-lg items-center justify-center rounded-full border-2 border-system-red active:bg-gray-200 active:text-gray-700 ${isActive ? "bg-system-red border-gray-100 text-gray-100" : "bg-gray-100 border-gray-400 text-system-red"}`}
		>
			<DangerIcon />
		</button>
	);
}

export function CautionToggleButton({ isActive, onClick }: ToggleButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`w-fit h-fit p-[14px] flex shadow-lg items-center justify-center rounded-full border-2 border-system-orange active:bg-gray-200  active:text-gray-700 ${isActive ? "bg-system-orange border-gray-100 text-gray-100" : "bg-gray-100 border-gray-400 text-system-orange"}`}
		>
			<CautionIcon />
		</button>
	);
}

interface UndoButtonProps {
	onClick: () => void;
	disabled: boolean;
}

export function UndoButton({ onClick, disabled }: UndoButtonProps) {
	return (
		<button
			disabled={disabled}
			onClick={onClick}
			className={`w-fit h-fit p-[14px] flex items-center justify-center rounded-full border-2  ${disabled ? "bg-gray-300 border-gray-400 text-gray-500" : "active:bg-gray-200  active:text-gray-700 bg-primary-500 border-primary-500 text-gray-100"}`}
		>
			<UndoIcon width={24} height={24} />
		</button>
	);
}

export function ResetButton({ onClick, disabled }: UndoButtonProps) {
	return (
		<button
			disabled={disabled}
			onClick={onClick}
			className={`w-[56px] h-[56px] px-[6px] py-[14px] flex items-center justify-center rounded-full border-2  ${disabled ? "bg-gray-300 border-gray-400 text-gray-500" : "active:bg-gray-200  active:text-gray-700 bg-primary-500 border-primary-500 text-gray-100"}`}
		>
			<p className="text-kor-caption">초기화</p>
		</button>
	);
}


export function ReportButton({ ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			{...rest}
			className="rounded-full w-fit h-[50px] px-6 py-3 flex flex-row items-center shadow-lg font-semibold border-2 border-primary-500 bg-gray-100 text-primary-500 active:bg-gray-200"
		>
			제보하기
			<ReportIcon className="ml-3" stroke="#FF2D55" />
		</button>
	);
}
