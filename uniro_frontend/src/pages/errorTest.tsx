import useMutationError from "../hooks/useMutationError";
import { RouteId } from "../data/types/route";
import { CautionIssueType, DangerIssueType } from "../data/types/enum";
import { postFetch } from "../utils/fetch/fetch";
import { postReportRoute } from "../api/route";

const postReport = (
	univId: number,
	routeId: RouteId,
	body: { dangerFactors: DangerIssueType[]; cautionFactors: CautionIssueType[] },
): Promise<boolean> => {
	return postFetch<void, string>(`/${univId}/route/risk/${routeId}`, body);
};

export default function Errortest() {
	const [Modal400, { mutate: mutate400 }] = useMutationError(
		{
			//@ts-expect-error 강제 에러 발생
			mutationFn: () => postReport(1001, 1, { cautionFactors: ["TEST"], dangerFactors: [] }),
		},
		undefined,
		{
			fallback: {
				400: { mainTitle: "400 제목", subTitle: "400 부제목" },
				404: { mainTitle: "404 제목", subTitle: "404 부제목" },
			},
			onClose: () => { alert('close callback') }
		}
	);

	const [Modal404, { mutate: mutate404 }] = useMutationError(
		{
			mutationFn: () => postReport(1, 1, { cautionFactors: [], dangerFactors: [] }),
		},
		undefined,
		{
			fallback: {
				400: { mainTitle: "400 제목", subTitle: "400 부제목" },
				404: { mainTitle: "404 제목", subTitle: "404 부제목" },
			},
			onClose: () => { }
		}
	);

	const [Modal500, { mutate: mutate500 }] = useMutationError(
		{
			//@ts-expect-error 강제 에러 발생
			mutationFn: () => postReportRoute(1001, { startNodeId: 1, endNodeId: 1 }),
		},
		undefined,
		{
			fallback: {
				400: { mainTitle: "400 제목", subTitle: "400 부제목" },
				404: { mainTitle: "404 제목", subTitle: "404 부제목" },
			},
			onClose: () => { }
		}
	);

	return (
		<div>
			<div className="rounded-sm border border-dashed border-[#9747FF] flex flex-col justify-start space-y-5 p-5">
				<button className="border border-system-red" onClick={mutate400}>
					400 발생
				</button>
				<button className="border border-system-red" onClick={mutate404}>
					404 발생
				</button>
				<button className="border border-system-red" onClick={mutate500}>
					500 발생
				</button>
			</div>
			<Modal400 />
			<Modal404 />
			<Modal500 />
		</div>
	);
}
