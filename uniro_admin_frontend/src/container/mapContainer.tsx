import { ChangedType, RevisionDataType, RevisionType } from "../data/types/revision";
import useUniversity from "../hooks/useUniversity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchRevision } from "../api/admin";
import useLogin from "../hooks/useLogin";
import LogMap from "../component/LogMap";
import { useEffect, useState } from "react";
import RollbackModal from "../components/log/rollbackModal";
import FailModal from "../components/log/failModal";
import InfoModal from "../components/log/infoModal";

interface MapContainerProps {
	rev: RevisionType;
	data: RevisionDataType | undefined;
	freshRev: number;
}

export interface ChangedInfo {
	current: ChangedType;
	difference: ChangedType;
}

const MapContainer = ({ rev, data, freshRev }: MapContainerProps) => {
	const { accessToken } = useLogin();
	const { university } = useUniversity();
	const queryClient = useQueryClient();
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [failModalOpen, setFailModalOpen] = useState<boolean>(false);
	const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
	const [info, setInfo] = useState<ChangedInfo>();

	const { mutate } = useMutation({
		mutationFn: () => patchRevision(accessToken, university?.id ?? -1, data?.rev ?? -1),
		onSuccess: () => {
			closeModal();
			queryClient.invalidateQueries({ queryKey: [university?.id], exact: false });
		},
		onError: () => {
			closeModal();
			openFailModal();
		},
	});

	const openFailModal = () => {
		setFailModalOpen(true);
	};

	const closeFailModal = () => {
		setFailModalOpen(false);
	};

	const openModal = () => {
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	const openInfoModal = () => {
		setInfoModalOpen(true);
	};

	const closeInfoModal = () => {
		setInfoModalOpen(false);
		setInfo(undefined);
	};

	useEffect(() => {
		if (!info) return;
		openInfoModal();
	}, [info]);

	return (
		<div className="flex flex-col w-4/5 h-full pb-4 px-1">
			<div className="flex flex-row items-center justify-between w-full h-[50px] px-2">
				<div className="text-kor-heading2">
					VERSION : {data?.rev} / {rev.revTime.slice(0, 10)} {rev.revTime.slice(11, -1)}
				</div>
				<button
					onClick={openModal}
					className="rounded-100 bg-primary-500 py-2 px-4 text-system-skyblue hover:bg-primary-600"
				>
					수정하기
				</button>
			</div>
			<LogMap revisionData={data} center={university?.centerPoint} setInfo={setInfo} />
			{modalOpen && <RollbackModal rev={data!.rev} onRollback={() => mutate()} onClose={closeModal} />}
			{failModalOpen && <FailModal onClose={closeFailModal} />}
			{infoModalOpen && <InfoModal rev={rev.rev} freshRev={freshRev} info={info!} onClose={closeInfoModal} />}
		</div>
	);
};

export default MapContainer;
