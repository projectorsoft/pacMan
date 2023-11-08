import { AssetsManager } from "./assetsManager";
import { Asset } from "./enums";

export class SoundsPlayer {
    private _assetsManager: AssetsManager;
    private _audio!: HTMLAudioElement;
    
    public get audio(): HTMLAudioElement {
        return this._audio;
    }

    public constructor(assetsManager: AssetsManager) {
        this._assetsManager = assetsManager;
        this._audio = new Audio();
    }

    public play(asset: Asset): void {
        this._audio = this._assetsManager.getAudio(asset);
        this._audio.play();
    }
}