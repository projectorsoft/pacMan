import { Color } from "./enums";
import { Point } from "./point";

export class Pellet {
    private _context: CanvasRenderingContext2D;
    private _position: Point;
    private _radius: number = 4;

    get position(): Point {
        return this._position;
    }

    get radius(): number {
        return this._radius;
    }

    constructor(
        context: CanvasRenderingContext2D,
        position: Point
    ) {
        this._context = context;
        this._position = position;
    }

    public draw(): void {
        this._context.beginPath();
        this._context.arc(this._position.x, this._position.y, this._radius, 0, Math.PI * 2);
        this._context.fillStyle = Color.Orange;
        this._context.fill();
        this._context.closePath();
    }
}