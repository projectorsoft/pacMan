import { Asset } from "../enums";
import { IAsset } from "./IAsset";

export class FontAsset implements IAsset {
    private _path: string;
    private _name: Asset;
    private _data!: FontFace;

    public get name(): Asset {
        return this._name;
    }
    public get data(): FontFace {
        return this._data;
    }

    constructor(name: Asset, path: string) {
        this._name = name;
        this._path = path;
    }

    public load(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            new FontFace('PixelCode', `url(${this._path})`)
                .load()
                .then((font: FontFace) => {
                    this._data = font;
                    resolve(true);  
                })
                .catch(() => {
                    reject(false);
                });
        });
    }
}