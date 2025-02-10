import DangerIcon from "../../assets/danger.svg?react";
import CautionIcon from "../../assets/caution.svg?react";
import UndoIcon from "../../assets/undo.svg?react";

interface ToggleButtonProps {
	isActive: boolean;
	onClick: () => void;
}

export function DangerToggleButton({ isActive, onClick }: ToggleButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`w-fit h-fit p-[14px] flex items-center justify-center rounded-full border-[1.5px] active:bg-gray-200 active:border-gray-400 active:text-gray-700 ${isActive ? "bg-system-red border-gray-100 text-gray-100" : "bg-gray-100 border-gray-400 text-gray-700"}`}
		>
			<DangerIcon />
		</button>
	);
}

export function CautionToggleButton({ isActive, onClick }: ToggleButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`w-fit h-fit p-[14px] flex items-center justify-center rounded-full border-[1.5px] active:bg-gray-200 active:border-gray-400 active:text-gray-700 ${isActive ? "bg-system-orange border-gray-100 text-gray-100" : "bg-gray-100 border-gray-400 text-gray-700"}`}
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
			className={`w-fit h-fit p-[14px] flex items-center justify-center rounded-full border-[1.5px]  bg-gray-100 border-gray-400 text-gray-700 ${disabled ? "bg-gray-300" : "active:bg-gray-200 active:border-gray-400 active:text-gray-700"}`}
		>
			<UndoIcon />
		</button>
	);
}
