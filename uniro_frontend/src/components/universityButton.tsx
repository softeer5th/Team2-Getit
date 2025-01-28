import { MouseEvent } from "react";

interface UniversityButtonProps {
	name: string;
	img: string;
	selected: boolean;
	onClick: () => void;
}

export default function UniversityButton({ name, img, selected, onClick }: UniversityButtonProps) {
	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onClick();
	};

	return (
		<li className="my-[6px]">
			<button
				onClick={handleClick}
				className={`w-full h-full p-6 flex flex-row items-center border rounded-400 ${selected ? "border-primary-400 bg-system-skyblue text-primary-500" : "border-gray-400"} `}
			>
				<img src={`/src/assets/${img}`} className="mr-4" />
				<span className="text-kor-body2 font-medium leading-[140%]">{name}</span>
			</button>
		</li>
	);
}
