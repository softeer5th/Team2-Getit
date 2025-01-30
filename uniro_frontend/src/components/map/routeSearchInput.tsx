import { InputHTMLAttributes, ReactNode } from "react";
import Close from "/public/icons/close-circle.svg?react";
import { Link } from "react-router";

interface RouteInputProps extends InputHTMLAttributes<HTMLInputElement> {
	placeholder: string;
	children: ReactNode;
	value?: string;
	onCancel?: () => void;
	onClick: () => void;
}

export default function RouteInput({ placeholder, children, value, onCancel, onClick }: RouteInputProps) {
	return (
		<div
			className={`h-[50px] w-full max-w-[450px] flex flex-row justify-between items-center space-x-2 p-3 rounded-200 bg-gray-200 border border-gray-200`}
		>
			{children}
			<Link
				onClick={onClick}
				to="/building"
				className={`text-start flex-1 text-kor-body2  ${value ? "text-gray-900 font-semibold" : "text-gray-700 font-medium"}`}
			>
				{value ? value : placeholder}
			</Link>
			{value && (
				<button onClick={onCancel} className="cursor-pointer">
					<Close />
				</button>
			)}
		</div>
	);
}
