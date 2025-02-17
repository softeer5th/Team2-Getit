import { LogActionEnum } from "../../constant/enum/logActionEnum";

export type RevisionType = {
    rev: number;
    revTime: string;
    univId: number;
    action: LogActionEnum;
};
