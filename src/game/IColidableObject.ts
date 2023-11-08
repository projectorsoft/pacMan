import { Point } from "./point";

export interface IColidableObject {
    position: Point;
    velocity: Point;
}

export interface ICircleBasedSprite extends IColidableObject {
    radius: number;
}

export interface IRectangleBasedSprite extends IColidableObject {
    width: number;
    height: number;
}