import { Button } from "../controls/button";
import { Asset, Keys } from "../enums";
import { Helpers } from "../helpers/helpers";
import { Point } from "../point";
import { AssetsManager } from "./assetsManager";
import { InputManager } from "./inputManager";

export class OnScreenControlsManager {
    private _context: CanvasRenderingContext2D;
    private _inputManager: InputManager;
    private _assetsManager: AssetsManager;
    private _buttons: Button[] = [];
    private _position: Point = new Point(-300, -300);
    private _width: number = 100;
    private _height: number = 20;
    private _arrowsImg!: ImageBitmap;
    
    public set position(value: Point) {
        this._position = value;

        this.addButtons();
    }
    public set width(value: number) {
        this._width = value;
    }
    public set height(value: number) {
        this._height = value;
    }
    
    public constructor(context: CanvasRenderingContext2D, 
        inputManager: InputManager,
        assetsManager: AssetsManager) {
        this._context = context;
        this._inputManager = inputManager;
        this._assetsManager = assetsManager;
        this._inputManager.onTouch = this.onTouch.bind(this);
        this._arrowsImg = this._assetsManager.getImage(Asset.ArrowsImg) as ImageBitmap;
    }

    public draw(): void {
        if (Helpers.hasTouchScreen())
            this._context.drawImage(this._arrowsImg, this._position.x + this._width, this._position.y - this._height);
    }

    public bindOnTouch(): void {
        this._inputManager.onTouch = this.onTouch.bind(this);
    }

    private onTouch(point: Point): void {
        if (this._inputManager.lastKey !== Keys.Tap)
            return;

        this._buttons.forEach(button => {
            button.isClicked(point);
        });
    }

    private addButtons(): void {
        this._buttons = [];
        this.createButton(new Point(this._position.x + this._width, this._position.y), Keys.Left);
        this.createButton(new Point(this._position.x + 3 * this._width, this._position.y), Keys.Right);
        this.createButton(new Point(this._position.x + 2 * this._width, this._position.y - this._height), Keys.Up);
        this.createButton(new Point(this._position.x + 2 * this._width, this._position.y + this._height), Keys.Down);
    }

    private createButton(position: Point, key: Keys): void {
        const button = new Button(position, this._width, this._height);
        button.onClick = () => { this._inputManager.setKeyPressed(key, true) };
        this._buttons.push(button);
    }
}