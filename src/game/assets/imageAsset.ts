import { Asset } from "../enums";
import { IAsset } from "./IAsset";

export class ImageAsset implements IAsset {
    private _path: string;
    private _name: Asset;
    private _data!: CanvasImageSource;

    public get name(): Asset {
        return this._name;
    }
    public get data(): CanvasImageSource {
        return this._data;
    }

    constructor(name: Asset, path: string) {
        this._name = name;
        this._path = path;
    }

    public load(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => {
                this._data = image as HTMLImageElement;
                resolve(true);
            }, true);
            image.addEventListener('error', () => {
                reject(false);
            }, true);
            image.src = this._path;
        });
    }
}