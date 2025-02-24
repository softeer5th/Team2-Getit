import { ChangeEvent, InputHTMLAttributes, useRef, useState } from "react";
import Search from "../../public/icons/search.svg?react";
import ChevronLeft from "../../public/icons/chevron-left.svg?react";
import Close from "../../public/icons/close-circle.svg?react";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
	onChangeDebounce: (e: string) => void;
	placeholder: string;
}

export default function Input({ onChangeDebounce, placeholder, ...rest }: CustomInputProps) {
	const [isFocus, setIsFocus] = useState<boolean>();
	const [value, setValue] = useState<string>("");
	const timeOutRef = useRef<number>();

	const onFoucs = () => setIsFocus(true);
	const onBlur = () => setIsFocus(false);

	const resetInput = () => {
		setValue("");
		handleDebounce("");
	};

	const handleDebounce = (input: string) => {
		if (timeOutRef.current) {
			clearTimeout(timeOutRef.current);
		}

		timeOutRef.current = setTimeout(() => {
			onChangeDebounce(input);
			timeOutRef.current = undefined;
		}, 300);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const currentInput: string = e.target.value;

		setValue(currentInput);
		handleDebounce(currentInput);
	};

	return (
		<div
			className={`h-[60px] flex-1 min-w-0 mx-auto flex flex-row max-w-[450px] px-[14px] items-center justify-between border ${isFocus ? "border-gray-700" : "border-gray-400"} rounded-200`}
		>
			{isFocus ? <ChevronLeft stroke="#161616" /> : <Search stroke="#161616" />}
			<input
				placeholder={placeholder}
				value={value}
				className="h-full flex-1 min-w-0 mx-[14px] leading-[160%] font-medium text-gray-900 text-kor-body2 placeholder:text-gray-700 placeholder:font-medium caret-primary-500 appearance-none"
				{...rest}
				onChange={handleChange}
				onFocus={onFoucs}
				onBlur={onBlur}
			/>
			{value.length !== 0 && (
				<button onClick={resetInput} className="cursor-pointer">
					<Close />
				</button>
			)}
		</div>
	);
}
