import { Keys } from "../enums";
import { InputManager } from "../managers/inputManager";
import { Point } from "../point";

export class Button {
    public position!: Point;
    public width: number;
    public height: number;
    public onClick: Function;

    public constructor(position: Point,
        width: number,
        height: number) {
            this.position = position;
            this.width = width;
            this.height = height;
            this.onClick = () => null;
        }

    public isClicked(point: Point): boolean {
        if (point.x < this.position.x ||
            point.x > this.position.x + this.width ||
            point.y < this.position.y ||
            point.y > this.position.y + this.height)
            return false;

        if (this.onClick)
            this.onClick();
        
        return true;
    }
}