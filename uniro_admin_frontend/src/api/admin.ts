import { LoginBody } from "../data/types/login";
import { RevisionType } from "../data/types/revision";
import { getFetch, patchFetch, postFetch } from "../utils/fetch/fetch";
import { transformAllRevisions, transformGetRevision } from "./transformer/admin";
import { GetRevisionResponse } from "./type/response/admin";

export const login = ({ univId, code }: LoginBody) => {
	return postFetch<{ accessToken: string }, string | number>(`/admin/auth/login`, {
		univId: univId,
		code: code,
	});
};

export const getAllRevisions = (token: string, univId: number) => {
	return getFetch<RevisionType[]>(`/admin/${univId}/revisions`, undefined, token).then(transformAllRevisions);
};

export const getRevision = (token: string, univId: number, versionId: number) => {
	return getFetch<GetRevisionResponse>(`/admin/${univId}/revisions/${versionId}`, undefined, token).then((res) =>
		transformGetRevision(res, versionId),
	);
};

export const patchRevision = (token: string, univId: number, versionId: number) => {
	return patchFetch(`/admin/${univId}/revisions/${versionId}`, undefined, token);
};
