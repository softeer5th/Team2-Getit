import { ButtonHTMLAttributes, ReactNode } from "react";

interface CustopmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	variant?: "primary" | "secondary" | "disabled";
}

export default function Button({ children, variant = "primary", ...rest }: CustopmButtonProps) {
	let buttonStyle: string;

	switch (variant) {
		case "primary":
			buttonStyle = "cursor-pointer bg-primary-500 text-gray-100 active:bg-primary-600";
			break;
		case "secondary":
			buttonStyle = "cursor-pointer bg-gray-100 text-primary-500 border border-gray-400 active:bg-gray-200";
			break;
		case "disabled":
			buttonStyle = "bg-gray-300 text-gray-700";
			break;
		default:
			buttonStyle = "cursor-pointer bg-primary-500 text-gray-100 active:bg-primary-600";
			break;
	}

	return (
		<button
			{...rest}
			className={`w-full h-[58px] px-[24px] font-semibold text-kor-body1 rounded-300 ${buttonStyle}`}
			disabled={variant === "disabled"}
		>
			{children}
		</button>
	);
}
