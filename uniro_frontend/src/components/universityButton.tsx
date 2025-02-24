import { MouseEvent, useState } from "react";
import { University } from "../types/university";

interface UniversityButtonProps {
	university: University;
	selected: boolean;
	loading?: boolean;
	onClick: (e: MouseEvent<HTMLButtonElement>, univ: University) => void;
	onDbClick: (e: MouseEvent<HTMLButtonElement>, univ: University) => void;
}

export default function UniversityButton({ university, selected, onClick, onDbClick }: UniversityButtonProps) {
	const [imageLoaded, setImageLoaded] = useState(false);

	const { imageUrl, name } = university;

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onClick(e, university);
	};

	const handleDbClick = (e: MouseEvent<HTMLButtonElement>) => {
		onDbClick(e, university);
	};

	return (
		<li className="my-[6px]">
			<button
				onDoubleClick={handleDbClick}
				onClick={handleClick}
				className={`w-full h-full p-6 border rounded-400 text-left ${
					selected ? "border-primary-400 bg-system-skyblue text-primary-500" : "border-gray-400"
				}`}
			>
				<span className="inline-block w-[30px] h-[30px] relative align-middle">
					{!imageLoaded && <div className="absolute inset-0 bg-gray-300 rounded-full animate-pulse" />}
					<img
						src={imageUrl}
						className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
						alt={`${name} 로고`}
						onLoad={() => setImageLoaded(true)}
						onError={() => setImageLoaded(true)}
					/>
				</span>

				<span className="ml-4 inline-block align-middle text-kor-body2 font-medium leading-[140%]">{name}</span>
			</button>
		</li>
	);
}
