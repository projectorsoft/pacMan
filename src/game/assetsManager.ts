import { IAsset } from "./assets/IAsset";
import { AudioAsset } from "./assets/audioAsset";
import { FontAsset } from "./assets/fontAsset";
import { ImageAsset } from "./assets/imageAsset";
import { TranslationAsset } from "./assets/translationAsset";
import { Asset } from "./enums";
import { EnvironmentHelper } from "./helpers/environmentHelper";

export class AssetsManager {
    //private _assets: Record<string, IAsset> = {};
    private _assets: IAsset[] = [];
    private readonly _path = EnvironmentHelper.isDevelopment ? './src/' : './';

    public constructor() {
        this.addTranslationAsset(Asset.PlTranslations, `${this._path}assets/translations/pl.json`);
        this.addTranslationAsset(Asset.EnTranslations, `${this._path}assets/translations/en.json`);

        this.addImageAsset(Asset.LogoImg, `${this._path}assets/images/logo.png`);
        this.addImageAsset(Asset.WallsImg, `${this._path}assets/images/walls.png`);
        this.addImageAsset(Asset.GhostsImg, `${this._path}assets/images/ghosts.png`);
        this.addImageAsset(Asset.PlayerImg, `${this._path}assets/images/player.png`);

        this.addAudioAsset(Asset.NewGameAudio, `${this._path}assets/sounds/newGame.wav`);
        this.addAudioAsset(Asset.ChompAudio, `${this._path}assets/sounds/chomp.wav`);
        this.addAudioAsset(Asset.DeathAudio, `${this._path}assets/sounds/death.wav`);
        this.addAudioAsset(Asset.PanicAudio, `${this._path}assets/sounds/panic.wav`);
        this.addAudioAsset(Asset.AlarmAudio, `${this._path}assets/sounds/alarm.wav`);
        this.addAudioAsset(Asset.RetreatingAudio, `${this._path}assets/sounds/retreating.wav`);
        this.addAudioAsset(Asset.GhostEatenAudio, `${this._path}assets/sounds/ghostEaten.wav`);

        this.addFontAsset(Asset.PixelCodeFont, `${this._path}assets/fonts/pixelCode.woff`);
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
