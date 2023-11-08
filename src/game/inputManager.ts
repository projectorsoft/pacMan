import { Keys } from "./enums";

export class InputManager {
    private _keys: {[key: number]: boolean} = {};
    private _lastKey: Keys = Keys.None;

    public onKeyUp: () => void;
    public onKeyDown: () => void;

    get lastKey(): Keys {
        return this._lastKey;
    }

    public constructor() {
        this._keys[Keys.Left] = false;
        this._keys[Keys.Right] = false;
        this._keys[Keys.Up] = false;
        this._keys[Keys.Down] = false;
        this._keys[Keys.Enter] = false;

        this.registerKeyDown();
        this.registerKeyUp();

        this.onKeyUp = () => null;
        this.onKeyDown = () => null; 
    }

    public isKeyPressed(key: Keys): boolean {
        return this._keys[key];
    }

    private registerKeyDown(): void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            switch (event.keyCode) {
                case Keys.Left:
                    this.setKeyPressed(Keys.Left, true);
                    break;
                case Keys.Right:
                    this.setKeyPressed(Keys.Right, true);
                    break;
                case Keys.Up:
                    this.setKeyPressed(Keys.Up, true);
                    break;
                case Keys.Down:
                    this.setKeyPressed(Keys.Down, true);
                    break;
                case Keys.Enter:
                    this.setKeyPressed(Keys.Enter, true);
                    break;
            }

            if (this.onKeyDown)
                this.onKeyDown();
        });
    }

    private registerKeyUp(): void {
        window.addEventListener('keyup', (event: KeyboardEvent) => {
            switch (event.keyCode) {
                case Keys.Left:
                    this.setKeyPressed(Keys.Left, false);
                    break;
                case Keys.Right:
                    this.setKeyPressed(Keys.Right, false);
                    break;
                case Keys.Up:
                    this.setKeyPressed(Keys.Up, false);
                    break;
                case Keys.Down:
                    this.setKeyPressed(Keys.Down, false);
                    break;
                case Keys.Enter:
                    this.setKeyPressed(Keys.Enter, false);
                    break;
            }

            if (this.onKeyUp)
                this.onKeyUp();
        });
    }

    private setKeyPressed(key: Keys, pressed: boolean): void {
        this._keys[key] = pressed;
        this._lastKey = key;
    }
}