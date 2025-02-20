import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { login } from "../api/admin";
import useLogin from "../hooks/useLogin";
import useUniversity from "../hooks/useUniversity";
import { getUniversityList } from "../api/search";

function LoginPage() {
	const [tempId, setTempId] = useState<number>();
	const [code, setCode] = useState<string>("");

	const { setIsLogin, setAccessToken } = useLogin();
	const { setUniversity } = useUniversity();

	const { data: universityList } = useQuery({ queryKey: ["university"], queryFn: getUniversityList });

	const { mutate } = useMutation({
		mutationFn: () => login({ univId: tempId ? tempId : -1, code: code }),
		onSuccess: (data) => {
			if (!tempId) return;

			const matchedUniv = universityList?.find((el) => el.id === tempId);

			console.log("SUCCESS", tempId, matchedUniv, universityList);
			if (!matchedUniv) return;

			setIsLogin(true);
			setAccessToken(data.accessToken);
			setUniversity(matchedUniv);
		},
	});

	return (
		<div className="w-screen h-screen flex  items-center justify-center">
			<div className="w-1/4 h-1/3 flex flex-col border border-dashed border-[#9747FF]">
				<input
					className="h-[30px] border border-gray-900 rounded-100 "
					type="number"
					onChange={(e) => setTempId(Number(e.target.value))}
					value={tempId ?? ""}
					placeholder="대학교 ID"
				/>
				<input
					className="h-[30px] border border-gray-900 rounded-100 "
					onChange={(e) => setCode(e.target.value)}
					value={code}
					placeholder="입장 코드"
				/>
				<button onClick={() => mutate()}>로그인</button>
			</div>
		</div>
	);
}

export default LoginPage;
