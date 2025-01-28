import { useState } from "react";
import Input from "../components/customInput";
import UniversityButton from "../components/universityButton";
import { UniversityList } from "../constant/university";
import Button from "../components/customButton";
import { Link } from "react-router";

export default function UniversitySearchPage() {
	const [selectedUniv, setSelectedUniv] = useState<string>("");

	return (
		<div className="relative flex flex-col h-screen w-full max-w-[450px] mx-auto py-5">
			<div className="w-full px-[14px] pb-[17px] border-b-[1px] border-gray-400">
				<Input onLengthChange={() => { }} placeholder="우리 학교를 검색해보세요" handleVoiceInput={() => { }} />
			</div>
			<div className="overflow-y-scroll flex-1">
				<ul
					className="w-full h-full px-[14px] py-[6px]"
					onClick={() => {
						setSelectedUniv("");
					}}
				>
					{UniversityList.map(({ name, img }) => (
						<UniversityButton
							selected={selectedUniv === name}
							onClick={() => {
								setSelectedUniv(name);
							}}
							name={name}
							img={img}
						/>
					))}
				</ul>
			</div>
			<div className="px-[14px]">
				{selectedUniv !== "" && (
					<Link to="/">
						<Button variant="primary">다음</Button>
					</Link>
				)}
			</div>
		</div>
	);
}
