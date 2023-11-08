import { ICircleBasedSprite } from "./IColidableObject";
import { Color } from "./enums";
import { Helpers } from "./helpers";
import { Point } from "./point";

export class PowerUp implements ICircleBasedSprite {
    private _context: CanvasRenderingContext2D;
    private _position: Point;
    private _radius: number;
    private _alpha: number = 0;

    get position(): Point {
        return this._position;
    }

    get radius(): number {
        return this._radius;
    }

    get velocity(): Point {
        return new Point(0, 0);
    }

    constructor(context: CanvasRenderingContext2D, position: Point) {
        this._context = context;
        this._position = position;
        this._radius = 8;
    }


    public draw(): void {
        this._context.beginPath();
        this._context.arc(this._position.x, this._position.y, this._radius, 0, Math.PI * 2);
        this._context.fillStyle = Helpers.addAlphaValueToColor(Color.Purple, this._alpha);
        this._context.fill();
        this._context.closePath();
    }

    public update() {
        this._alpha += 0.05;

        if (this._alpha >= 1)
            this._alpha = 0;
    }
}