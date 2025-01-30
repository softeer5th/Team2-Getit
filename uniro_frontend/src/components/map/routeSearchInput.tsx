import { InputHTMLAttributes, ReactNode } from "react";
import Close from "/public/icons/close-circle.svg?react";

interface RouteInputProps extends InputHTMLAttributes<HTMLInputElement> {
	placeholder: string;
	children: ReactNode;
	value?: string;
	onCancel?: () => void;
}

export default function RouteInput({ placeholder, children, value, onCancel }: RouteInputProps) {
	return (
		<div
			className={`h-[50px] w-full max-w-[450px] flex flex-row justify-between items-center space-x-2 p-3 rounded-200 bg-gray-200 border border-gray-200`}
		>
			{children}
			<input
				placeholder={placeholder}
				value={value}
				disabled
				className="flex-1 text-kor-body2 font-semibold text-gray-900 placeholder:text-gray-700 placeholder:font-medium placeholder:text-kor-body2"
			/>
			{value && (
				<button onClick={onCancel} className="cursor-pointer">
					<Close />
				</button>
			)}
		</div>
	);
}
