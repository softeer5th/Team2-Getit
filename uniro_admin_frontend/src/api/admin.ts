import { LoginBody } from "../data/types/login";
import { RevisionType } from "../data/types/revision";
import { getFetch, postFetch } from "../utils/fetch/fetch";
import { transformAllRevisions } from "./transformer/admin";

export const login = ({ univId, code }: LoginBody) => {
    return postFetch<{ accessToken: string }, string | number>(
        `/admin/auth/login`,
        {
            univId: univId,
            code: code,
        }
    );
};
