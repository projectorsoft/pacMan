import { Direction, GhostMode, GhostType } from "../enums";
import { Point } from "../point";
import { IMap } from "./IMap";

export const map2: IMap = {
    data: [
        ['1', '-', '-', '-', '-', '-', '-', '-', '2'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['|', '.', '1', '>', ' ', '<', '2', '.', '|'],
        ['|', '.', '|', ' ', ' ', ' ', '|', '.', '|'],
        ['|', '.', '4', '-', '-', '-', '3', '.', '|'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['|', '.', 'b', 'p', 'b', 'p', 'b', '.', '|'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['4', '-', '-', '-', '-', '-', '-', '-', '3'],
    ],
    respawnPoint: new Point(4, 3),
    ghostsSettings: [
        { 
            type: GhostType.Blinky,
            mode: GhostMode.Chase,
            startPosition: new Point(4, 3),
            startDirection: Direction.Top,
            delay: 400
        }
    ]
}