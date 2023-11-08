import { IGhostSettings } from "../IGhostSettings";
import { Point } from "../point";

export interface IMap {
    data: string[][];
    respawnPoint: Point,
    ghostsSettings: IGhostSettings[]
}