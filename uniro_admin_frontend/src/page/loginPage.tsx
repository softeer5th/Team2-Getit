import { useMutation, useQuery } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { login } from "../api/admin";
import useLogin from "../hooks/useLogin";
import useUniversity from "../hooks/useUniversity";
import Logo from "../assets/navbar/UNIRO_ADMIN.svg?react";
import { getUniversityList } from "../api/search";
import { BadRequestError, ForbiddenError } from "../constant/error";

function LoginPage() {
	const [tempId, setTempId] = useState<number>();
	const [code, setCode] = useState<string>("");

	const { setIsLogin, setAccessToken } = useLogin();
	const { setUniversity } = useUniversity();
	const [errorMessage, setErrorMessage] = useState<string>("");

	const { data: universityList } = useQuery({ queryKey: ["university"], queryFn: getUniversityList });

	const { isPending, mutate } = useMutation({
		mutationFn: () => login({ univId: tempId ? tempId : -1, code: code }),
		onSuccess: (data) => {
			if (!tempId) return;

			const matchedUniv = universityList?.find((el) => el.id === tempId);

			if (!matchedUniv) return;

			setIsLogin(true);
			setAccessToken(data.accessToken);
			setUniversity(matchedUniv);
		},
		onError: (error) => {
			if (error instanceof BadRequestError) {
				setErrorMessage("올바르지 못한 학교 ID 입니다.");
			} else if (error instanceof ForbiddenError) {
				setErrorMessage("잘못된 입장 코드 입니다.");
			} else {
				setErrorMessage("알 수 없는 오류가 발생했습니다.");
			}
		},
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const number = e.target.value;

		if (number[0] === "0") setTempId(Number(e.target.value.slice(1, -1)));
		setTempId(Number(e.target.value));
	};

	useEffect(() => {
		if (errorMessage !== "") {
			setTimeout(() => {
				setErrorMessage("");
			}, 3000);
		}
	}, [errorMessage]);

	return (
		<div className="w-screen h-screen flex flex-col items-center justify-center">
			<Logo className="min-w-[300px] h-1/8" />
			<div className="w-1/4 h-1/3 flex flex-col items-center space-y-5">
				<input
					className="w-full h-[40px] min-w-[350px] border border-gray-500 rounded-100 "
					type="number"
					onChange={handleChange}
					value={tempId ?? ""}
					placeholder="대학교 ID"
				/>
				<input
					className="w-full h-[40px] min-w-[350px] border border-gray-500 rounded-100 "
					onChange={(e) => setCode(e.target.value)}
					value={code}
					placeholder="입장 코드"
				/>
				<p className="w-full h-[20px] text-start text-xs text-system-red font-semibold">{errorMessage}</p>
				<button
					className="max-w-[300px] w-full h-[40px] rounded-100 font-semibold bg-primary-500 active:bg-primary-700 text-gray-100"
					onClick={() => mutate()}
				>
					로그인
				</button>
			</div>
		</div>
	);
}

export default LoginPage;
