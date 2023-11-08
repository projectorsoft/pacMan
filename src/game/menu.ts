import { AssetsManager } from "./assetsManager";
import { Asset, Color, Keys } from "./enums";
import { Helpers } from "./helpers";
import { InputManager } from "./inputManager";
import { Point } from "./point.js";
import { Placeholder, TranslationsService } from "./translationsService";

export class Menu {
    private _context: CanvasRenderingContext2D;
    private _inputManager: InputManager;
    private _translationsService: TranslationsService;
    private _logoImg: ImageBitmap;
    private _xOffset: number = -405;
    private _yOffset: number = 200;
    private _animationStoped: boolean = false;
    private _items: MenuItem[] = [];
    private _selectedIndex: number = 0;
    private _alpha: number = 0;
    public highScore: number = 0;

    public onItemSelected: () => void;

    constructor(context: CanvasRenderingContext2D,
        inputManager: InputManager,
        assetsManager: AssetsManager,
        translationsService: TranslationsService) {
            this._context = context;
            this._inputManager = inputManager;
            this._inputManager.onKeyUp = this.onKeyUp.bind(this);
            this._translationsService = translationsService;

            this._logoImg = assetsManager.getImage(Asset.LogoImg) as ImageBitmap;
            this.onItemSelected = () => null;

            this._items = [
                new MenuItem(this._translationsService.getTranslation('onePlayer'), new Point(0, this._yOffset + 200)),
                new MenuItem(this._translationsService.getTranslation('twoPlayers'), new Point(0, this._yOffset + 250))
            ]

            this.reset();
    }

    public update(): void {
        if (this._xOffset < 0)
            this._xOffset += 15;
        else
            this._animationStoped = true;

        if (this._animationStoped) {
            this._alpha += 0.03;

            if (this._alpha >= 1)
                this._alpha = 0;
        }

        this.draw();
    }

    public draw(): void {
        this._items.forEach(item => {
            item.position.x = this._xOffset + 400;
            this.drawText(item.text, item.position);
        });

        this._context.drawImage(this._logoImg, this._xOffset + (1000 - this._logoImg.width) / 2, this._yOffset);

        if (this._animationStoped) {
            this.drawSelector();

            this.drawText(this._translationsService.getTranslation('highScore', new Placeholder('score', this.highScore.toString())), new Point((1150 - this._logoImg.width) / 2, 100), Color.Red);
            this.drawText(this._translationsService.getTranslation('pressEnter'), new Point((970 - this._logoImg.width) / 2, this._yOffset + 300), Helpers.addAlphaValueToColor(Color.White, this._alpha));
        }
    }

    private drawText(text: string, position: Point, color: string = Color.White): void {
        this._context.font = '32px PixelCode';
        this._context.fillStyle = color;
        this._context.textAlign = 'left';
        this._context.fillText(text, position.x, position.y, 1000);
    }

    private drawSelector(): void {
        const selectedItem = this._items[this._selectedIndex];

        if (!selectedItem)
            return;

        this._context.beginPath();
        this._context.moveTo(selectedItem.position.x - 40, selectedItem.position.y - 25);
        this._context.lineTo(selectedItem.position.x - 40, selectedItem.position.y);
        this._context.lineTo(selectedItem.position.x - 20, selectedItem.position.y -10);
        this._context.fillStyle = Color.White;
        this._context.fill();
        this._context.closePath();
    }

    public reset(): void {
        this._xOffset = -405;
        this._selectedIndex = 0;

        this._items.forEach(item => {
            item.position.x = 0;
        });

        this._animationStoped = false;
    }

    private onKeyUp(): void {
        if (!this._animationStoped)
            return;

        switch (this._inputManager.lastKey) {
            case Keys.Enter:
                if (this.onItemSelected)
                    this.onItemSelected();
                break;
            case Keys.Up:
                this._selectedIndex = this._selectedIndex - 1;

                if (this._selectedIndex < 0)
                    this._selectedIndex = 1;
                break;
            case Keys.Down:
                this._selectedIndex = this._selectedIndex + 1;

                if (this._selectedIndex >= this._items.length)
                    this._selectedIndex = 0;
                break;
        }
    }
}

export class MenuItem {
    public text: string;
    public position: Point;

    public constructor(text: string, 
        position: Point) {
        this.text = text;
        this.position = position;
    }
}