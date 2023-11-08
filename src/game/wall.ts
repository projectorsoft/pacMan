import { IRectangleBasedSprite } from "./IColidableObject.js";
import { AssetsManager } from "./assetsManager.js";
import { Asset, WallType } from "./enums.js";
import { Point } from "./point.js";

export class Wall implements IRectangleBasedSprite {
    public static Width: number = 30;
    public static Height: number = 30;

    private _context: CanvasRenderingContext2D;
    private _position: Point;
    private _image: CanvasImageSource;
    private _type: WallType = WallType.None;

    get width(): number {
        return Wall.Width;
    }

    get height(): number {
        return Wall.Height;
    }
    
    get velocity(): Point {
        return new Point(0, 0);
    }

    get position(): Point {
        return this._position;
    }

    constructor(context: CanvasRenderingContext2D, 
        assetsManager: AssetsManager,
        position: Point, 
        type: WallType) {
        this._context = context;
        this._position = position;
        this._type = type;
        this._image = assetsManager.getImage(Asset.WallsImg);
    }

    public draw(): void {
        this._context.drawImage(this._image, 
            this._type * Wall.Width,
            0, 
            Wall.Width,
            Wall.Height,
            this._position.x, 
            this._position.y, 
            Wall.Width, 
            Wall.Height);
    }
}