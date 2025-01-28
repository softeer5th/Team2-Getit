import { MouseEvent } from "react";

interface UniversityButtonProps {
	name: string;
	img: string;
	selected: boolean;
	onClick: () => void;
}

const svgModules = import.meta.glob("/src/assets/university/*.svg", { eager: true });

export default function UniversityButton({ name, img, selected, onClick }: UniversityButtonProps) {
	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onClick();
	};

	const svgPath = (svgModules[`/src/assets/university/${img}`] as { default: string })?.default;

	return (
		<li className="my-[6px]">
			<button
				onClick={handleClick}
				className={`w-full h-full p-6 flex flex-row items-center border rounded-400 ${selected ? "border-primary-400 bg-system-skyblue text-primary-500" : "border-gray-400"} `}
			>
				<img src={svgPath} className="mr-4" />
				<span className="text-kor-body2 font-medium leading-[140%]">{name}</span>
			</button>
		</li>
	);
}
