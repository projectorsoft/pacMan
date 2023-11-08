import { IAsset } from "./assets/IAsset";
import { AudioAsset } from "./assets/audioAsset";
import { FontAsset } from "./assets/fontAsset";
import { ImageAsset } from "./assets/imageAsset";
import { TranslationAsset } from "./assets/translationAsset";
import { Asset } from "./enums";

export class AssetsManager {
    //private _assets: Record<string, IAsset> = {};
    private _assets: IAsset[] = [];

    public constructor() {
        this.addTranslationAsset(Asset.PlTranslations, './src/assets/translations/pl.json');
        this.addTranslationAsset(Asset.EnTranslations, './src/assets/translations/en.json');

        this.addImageAsset(Asset.LogoImg, './src/assets/images/logo.png');
        this.addImageAsset(Asset.WallsImg, './src/assets/images/walls.png');
        this.addImageAsset(Asset.GhostsImg, './src/assets/images/ghosts.png');
        this.addImageAsset(Asset.PlayerImg, './src/assets/images/player.png');

        this.addAudioAsset(Asset.NewGameAudio, './src/assets/sounds/newGame.wav');
        this.addAudioAsset(Asset.ChompAudio, './src/assets/sounds/chomp.wav');
        this.addAudioAsset(Asset.DeathAudio, './src/assets/sounds/death.wav');
        this.addAudioAsset(Asset.PanicAudio, './src/assets/sounds/panic.wav');
        this.addAudioAsset(Asset.AlarmAudio, './src/assets/sounds/alarm.wav');
        this.addAudioAsset(Asset.RetreatingAudio, './src/assets/sounds/retreating.wav');
        this.addAudioAsset(Asset.GhostEatenAudio, './src/assets/sounds/ghostEaten.wav');

        this.addFontAsset(Asset.PixelCodeFont, './src/assets/fonts/pixelCode.woff');
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

    public getImage(asset: Asset): CanvasImageSource{
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
