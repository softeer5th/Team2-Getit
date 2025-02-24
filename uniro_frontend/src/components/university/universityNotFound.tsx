import SearchNull from "../error/SearchNull";

export default function UniversityNotFound() {
	return (
		<div className="h-full w-full flex justify-center items-center">
			<SearchNull message="해당 학교를 찾을 수 없습니다." />
		</div>
	);
}
