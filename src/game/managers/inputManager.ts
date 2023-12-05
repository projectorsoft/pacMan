import { Keys } from "../enums";
import { Helpers } from "../helpers/helpers";
import { Point } from "../point";

export class InputManager {
    private _keys: {[key: number]: boolean} = {};
    private _lastKey: Keys = Keys.None;
    private _lastTouchCoordinates: Point = new Point(0, 0);
    private _scale: Point = new Point(1, 1);

    public onKeyUp: () => void;
    public onKeyDown: () => void;
    public onTouch: (touchPoint: Point) => void;

    get lastKey(): Keys {
        return this._lastKey;
    }
    public get lastTouchCoordinates(): Point {
        return this._lastTouchCoordinates;
    }

    public constructor() {
        this._keys[Keys.Left] = false;
        this._keys[Keys.Right] = false;
        this._keys[Keys.Up] = false;
        this._keys[Keys.Down] = false;
        this._keys[Keys.Enter] = false;

        if (Helpers.hasTouchScreen()) {
            //window.addEventListener('touchmove', (event: TouchEvent) => this.registerTouchEvents(event, true));
            window.addEventListener('touchstart', (event: TouchEvent) => this.registerTouchEvents(event, true));
            //window.addEventListener('touchend', () => this.setKeyPressed(Keys.Tap, false));
        } else {
            this.registerKeyDown();
            this.registerKeyUp();
        }

        this.onKeyUp = () => null;
        this.onKeyDown = () => null;
        this.onTouch = () => null; 
    }

    public setScale(scaleX: number, scaleY: number): void {
        this._scale = new Point(scaleX, scaleY);
    }

    public isKeyPressed(key: Keys): boolean {
        return this._keys[key];
    }

    private registerTouchEvents(event: TouchEvent, pressed: boolean): void {
        if (event.touches && event.touches[0]) {
            this._lastTouchCoordinates.x = Math.floor(event.touches[0].clientX * this._scale.x);
            this._lastTouchCoordinates.y = Math.floor(event.touches[0].clientY * this._scale.y);
        }

        this.setKeyPressed(Keys.Tap, pressed);
        
        if (this.onTouch)
            this.onTouch(this._lastTouchCoordinates);
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

    public setKeyPressed(key: Keys, pressed: boolean): void {
        this._keys[key] = pressed;
        this._lastKey = key;
    }
}