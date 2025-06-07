import { Helper } from "@/dls";
import { ValidraResult } from "./interfaces";

export type Rule = Helper & {
    message?: string;
    code?: string;
    negative?: boolean;
};
