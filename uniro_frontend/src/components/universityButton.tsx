import { MouseEvent, useState } from "react";

interface UniversityButtonProps {
	name: string;
	img: string;
	selected: boolean;
	loading?: boolean;
	onClick: () => void;
}

export default function UniversityButton({ name, img, selected, loading, onClick }: UniversityButtonProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onClick();
	};

	return (
		<li className="my-[6px]">
			<button
				onClick={handleClick}
				className={`w-full h-full p-6 flex flex-row items-center border rounded-400 ${
					selected ? "border-primary-400 bg-system-skyblue text-primary-500" : "border-gray-400"
				}`}
			>
				{!imageLoaded && <div className="w-[30px] h-[30px] bg-gray-300 rounded-full  animate-pulse" />}
				<img
					src={img}
					className={`mr-4 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
					alt={`${name} 로고`}
					onLoad={() => setImageLoaded(true)}
					onError={() => setImageLoaded(true)} // 에러 발생 시에도 로딩 완료로 간주
				/>

				<span className="text-kor-body2 font-medium leading-[140%]">{name}</span>
			</button>
		</li>
	);
}
