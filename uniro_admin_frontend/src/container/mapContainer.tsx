import { RevisionDataType, RevisionType } from "../data/types/revision";
import useUniversity from "../hooks/useUniversity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchRevision } from "../api/admin";
import useLogin from "../hooks/useLogin";
import LogMap from "../component/LogMap";
import { useEffect, useState } from "react";

interface MapContainerProps {
	rev: RevisionType;
	data: RevisionDataType | undefined;
}


const MapContainer = ({ rev, data }: MapContainerProps) => {
	const { accessToken } = useLogin();
	const { university } = useUniversity();
	const queryClient = useQueryClient();
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [failModalOpen, setFailModalOpen] = useState<boolean>(false);

	const { status, isSuccess, mutate } = useMutation({
		mutationFn: () => patchRevision(accessToken, university?.id ?? -1, data?.rev ?? -1),
		onSuccess: () => {
			closeModal();
			queryClient.invalidateQueries({ queryKey: [university?.id], exact: false, });
		},
		onError: () => {
			closeModal();
			openFailModal();
		}
	})

	const openFailModal = () => {
		setFailModalOpen(true)
	}

	const closeFailModal = () => {
		setFailModalOpen(false);
	}

	const openModal = () => {
		setModalOpen(true)
	}

	const closeModal = () => {
		setModalOpen(false);
	}


	return (
		<div className="flex flex-col w-4/5 h-full pb-4 px-1">
			<div className="flex flex-row items-center justify-between w-full h-[50px] px-2">
				<div className="text-kor-heading2">VERSION : {data?.rev} / {rev.revTime.slice(0, 10)}  {rev.revTime.slice(11, -1)}</div>
				<button onClick={openModal} className="rounded-100 bg-primary-500 py-2 px-4 text-system-skyblue hover:bg-primary-600">
					수정하기
				</button>
			</div>
			<LogMap revisionData={data} center={university?.centerPoint} />
			{
				modalOpen &&
				<div className="w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
					<div className="w-[300px] h-[300px] bg-gray-100 rounded-200 p-5 space-y-4 flex flex-col justify-center">
						<h2 className="font-bold text-xl "><i>{data?.rev}</i> 로 되돌리시겠습니까?</h2>
						<p className="font-semibold">되돌리기 작업은 취소될 수 없습니다.</p>
						<div className="w-full flex justify-around ">
							<button className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-primary-500" onClick={() => mutate()}>확인</button>
							<button className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-system-red" onClick={closeModal}>취소</button>
						</div>
					</div>
				</div>
			}
			{
				failModalOpen &&
				<div className="w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
					<div className="w-[300px] h-[300px] bg-gray-100 rounded-200 p-5 space-y-4 flex flex-col justify-center">
						<h2 className="font-bold text-xl text-system-red ">에러가 발생하였습니다.</h2>
						<p className="font-semibold">관리자에게 문의바랍니다.</p>
						<div className="w-full flex justify-around ">
							<button className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-system-red" onClick={closeFailModal}>확인</button>
						</div>
					</div>
				</div>
			}
		</div>
	);
};

export default MapContainer;
