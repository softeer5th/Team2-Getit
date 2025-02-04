import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function useNetworkStatus() {
	const [isOffline, setIsOffline] = useState(false);
	const navigate = useNavigate();

	const handleOffline = () => {
		setIsOffline(true);
		navigate("/error/offline");
	};

	const handleOnline = () => {
		setIsOffline(false);
		navigate(-1);
	};

	useEffect(() => {
		window.addEventListener("offline", handleOffline);
		window.addEventListener("online", handleOnline);

		return () => {
			window.removeEventListener("offline", handleOffline);
			window.removeEventListener("online", handleOnline);
		};
	});
}
