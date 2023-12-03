import { IAsset } from "../assets/IAsset";
import { AudioAsset } from "../assets/audioAsset";
import { FontAsset } from "../assets/fontAsset";
import { ImageAsset } from "../assets/imageAsset";
import { TranslationAsset } from "../assets/translationAsset";
import { Asset } from "../enums";
import { EnvironmentHelper } from "../helpers/environmentHelper";


export class AssetsManager {
    //private _assets: Record<string, IAsset> = {};
    private _assets: IAsset[] = [];
    public static readonly Path = EnvironmentHelper.isDevelopment ? './src/' : './';

    public constructor() {
    }

    public addTranslationAsset(name: Asset, path: string) {
        this._assets.push(new TranslationAsset(name, path));
    }

    public addImageAsset(name: Asset, path: string) {
        this._assets.push(new ImageAsset(name, path));
    }

    public addAudioAsset(name: Asset, path: string) {
        this._assets.push(new AudioAsset(name, path));
    }

    public addFontAsset(name: Asset, path: string) {
        this._assets.push(new FontAsset(name, path));
    }

    public getTranslation(asset: Asset): {} {
        return this._assets.find(a => a.name === asset)?.data;
    }

    public getImage(asset: Asset): ImageBitmap{
        return this._assets.find(a => a.name === asset)?.data;
    }

    public getAudio(asset: Asset): HTMLAudioElement{
        return this._assets.find(a => a.name === asset)?.data;
    }

    public getFont(asset: Asset): FontFace {
        return this._assets.find(a => a.name === asset)?.data;
    }

    public loadAll(): Promise<boolean[]> {
        const promises: Promise<boolean>[] = [];

        this._assets.forEach(a => promises.push(a.load()));
        return Promise.all(promises);
    }
}
