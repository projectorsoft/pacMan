import { Asset } from "../enums";

export interface IAsset {
    load(): Promise<boolean>;

    name: Asset;
    data: any;
}