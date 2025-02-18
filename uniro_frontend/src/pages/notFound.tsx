import { useNavigate } from "react-router";
import Button from "../components/customButton";
import NotFound from "../components/error/NotFound";

export default function NotFoundPage() {
	const navigate = useNavigate();

	const handleGoBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	};

	return (
		<div className="relative flex flex-col h-dvh w-full max-w-[450px] mx-auto justify-center items-center">
			<NotFound />
			<div onClick={handleGoBack} className="absolute bottom-6 space-y-2 w-full px-4">
				<Button variant="primary">{window.history.length > 1 ? "뒤로 가기" : "홈으로 이동"}</Button>
			</div>
		</div>
	);
}
