import { Direction, GhostMode, GhostType } from "./enums";
import { Point } from "./point";

export interface IGhostSettings {
    type: GhostType;
    mode: GhostMode;
    startPosition: Point,
    startDirection: Direction,
    delay: number;
}