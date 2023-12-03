import { IGhostSettings } from "../IGhostSettings";
import { Direction } from "../enums";
import { Point } from "../point";

export interface IMap {
    data: string[][];
    respawnPoint: Point,
    respawnDirection: Direction,
    ghostsSettings: IGhostSettings[]
}