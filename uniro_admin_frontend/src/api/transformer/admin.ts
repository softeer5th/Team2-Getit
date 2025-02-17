import { RevisionType } from "../../data/types/revision";

export const transformAllRevisions = (data: RevisionType[]): RevisionType[] => {
    return data.reverse();
};
