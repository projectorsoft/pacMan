import { Point } from "./point";

export class Label {
    private _context: CanvasRenderingContext2D;
    private _position: Point;
    private _fontSize: number;
    private _fontFamily: string = "PixelCode";
    private _fontColor: string;

    constructor(context: CanvasRenderingContext2D, position: Point, color: string, fontSize: number = 28) {
        this._context = context;
        this._position = position;
        this._fontSize = fontSize;
        this._fontFamily;
        this._fontColor = color;
    }

    public draw(text: string): void {
        this._context.beginPath();

        this._context.font = `${this._fontSize}px ${this._fontFamily}`;
        this._context.fillStyle = this._fontColor;
        this._context.textAlign = 'left';
        this._context.fillText(`${text}`, this._position.x, this._position.y, this._context.measureText(text).width);
        this._context.closePath();
    }
}