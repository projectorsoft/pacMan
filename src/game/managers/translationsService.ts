import { AssetsManager } from "./assetsManager";
import { Asset } from "../enums";

export class TranslationsService {
    private _assetsManager: AssetsManager;
    private _locale: string = 'en';
    private _translations: any = {};

    public get locale(): string {
        return this._locale;
    }
    public set locale(value: string) {
        this._locale = value;

        switch (value) {
            case 'pl':
                this._translations = this._assetsManager.getTranslation(Asset.PlTranslations);
                break;
            case 'en':
            default:
                this._translations = this._assetsManager.getTranslation(Asset.EnTranslations);
                break;
        }
    }

    public constructor(assetsManager: AssetsManager) {
        this._assetsManager = assetsManager;
        this.locale = 'en';
    }

    getTranslation(key: string, placeholder?: Placeholder): string {
        const translation = this._translations[key];

        return placeholder ? translation.replace(`{${placeholder.key}}`, placeholder.value) : translation;
    }
}

export class Placeholder {
    public key!: string;
    public value!: string;

    public constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }
}