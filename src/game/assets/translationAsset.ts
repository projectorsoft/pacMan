import { Asset } from "../enums";
import { IAsset } from "./IAsset";

export class TranslationAsset implements IAsset {
    private _path: string;
    private _name: Asset;
    private _data!: {};

    public get name(): Asset {
        return this._name;
    }
    public get data(): {} {
        return this._data;
    }

    constructor(name: Asset, path: string) {
        this._name = name;
        this._path = path;
    }

    public load(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(this._path)
                .then((translations: Response) => {
                    translations.json().then((data) => this._data = data);
                    resolve(true);  
                })
                .catch(() => reject(false));
        });
    }
}