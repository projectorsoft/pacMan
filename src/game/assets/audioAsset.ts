import { Asset } from "../enums";
import { IAsset } from "./IAsset";

export class AudioAsset implements IAsset {
    private _path: string;
    private _name: Asset;
    private _data!: HTMLAudioElement;

    public get name(): Asset {
        return this._name;
    }
    public get data(): HTMLAudioElement {
        return this._data;
    }

    constructor(name: Asset, path: string) {
        this._name = name;
        this._path = path;
    }

    public load(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const audio = new Audio(this._path);
            audio.autoplay = false;
            audio.addEventListener('loadeddata', () => {
                this._data = audio as HTMLAudioElement;
                resolve(true);
            }, true);
            audio.addEventListener('error', () => {
                reject(false);
            }, true);
        });
    }
}