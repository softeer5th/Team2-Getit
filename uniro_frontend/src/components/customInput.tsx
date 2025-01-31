import { ChangeEvent, InputHTMLAttributes, useCallback, useState } from "react";
import Search from "../../public/icons/search.svg?react";
import ChevronLeft from "../../public/icons/chevron-left.svg?react";
import Mic from "../../public/icons/mic.svg?react";
import Close from "../../public/icons/close-circle.svg?react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
	onLengthChange: (e: string) => void;
	placeholder: string;
	handleVoiceInput: () => void;
}

export default function Input({ onLengthChange, placeholder, handleVoiceInput, ...rest }: CustomInputProps) {
	const [isFocus, setIsFocus] = useState<boolean>(false);
	const [tempValue, setTempValue] = useState<string>("");
	const [currentValue, setCurrentValue] = useState<string>("");

	const onFoucs = () => setIsFocus(true);
	const onBlur = () => setIsFocus(false);

	const resetInput = () => {
		setCurrentValue("");
		setTempValue("");
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const currentInput: string = e.target.value;
		setTempValue(currentInput);
		if (currentValue.length !== currentInput.length) {
			setCurrentValue(currentInput);
			onLengthChange(currentInput);
		}
	};

	return (
		<div
			className={`h-[60px] w-full max-w-[450px] px-[14px] flex flex-row items-center justify-between border ${isFocus ? "border-gray-700" : "border-gray-400"} rounded-200`}
		>
			{isFocus ? <ChevronLeft stroke="#161616" /> : <Search stroke="#161616" />}
			<input
				placeholder={placeholder}
				value={tempValue}
				className="h-full flex-1 mx-[14px] leading-[160%] font-medium text-gray-900 text-kor-body2 placeholder:text-gray-700 placeholder:font-medium caret-primary-500"
				{...rest}
				onChange={handleChange}
				onFocus={onFoucs}
				onBlur={onBlur}
			/>
			{currentValue.length === 0 ? (
				<button onClick={handleVoiceInput} className="cursor-pointer">
					<Mic stroke="#161616" />
				</button>
			) : (
				<button onClick={resetInput} className="cursor-pointer">
					<Close />
				</button>
			)}
		</div>
	);
}
