import { Direction, GhostMode, GhostType } from "../enums";
import { Point } from "../point";
import { IMap } from "./IMap";

export const map0: IMap = {
    data: [
        ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', 'z', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['|', '.', '1', '-', '2', '.', '1', '-', '2', '.', '|', '.', '1', '-', '2', '.', '1', '-', '2', '.', '|'],
        ['|', 'p', '|', ' ', '|', '.', '|', ' ', '|', '.', '|', '.', '|', ' ', '|', '.', '|', ' ', '|', 'p', '|'],
        ['|', '.', '4', '-', '3', '.', '4', '-', '3', '.', '_', '.', '4', '-', '3', '.', '4', '-', '3', '.', '|'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['|', '.', '1', '-', '2', '.', '^', '.', '1', '-', '-', '-', '2', '.', '^', '.', '1', '-', '2', '.', '|'],
        ['|', '.', '4', '-', '3', '.', '|', '.', '4', '-', 'z', '-', '3', '.', '|', '.', '4', '-', '3', '.', '|'],
        ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
        ['4', '-', '-', '-', '2', '.', 'c', '-', '>', '.', '_', '.', '<', '-', 'x', '.', '1', '-', '-', '-', '3'],
        [' ', ' ', ' ', ' ', '|', '.', '|', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '|', '.', '|', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', '|', '.', '|', ' ', '1', '>', '~', '<', '2', ' ', '|', '.', '|', ' ', ' ', ' ', ' '],
        ['-', '-', '-', '-', '3', '.', '_', ' ', '|', ' ', ' ', ' ', '|', ' ', '_', '.', '4', '-', '-', '-', '-'],
        [' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', '4', '-', '-', '-', '3', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' '],
        ['-', '-', '-', '-', '2', '.', '^', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '^', '.', '1', '-', '-', '-', '-'],
        [' ', ' ', ' ', ' ', '|', '.', '|', ' ', '1', '-', '-', '-', '2', ' ', '|', '.', '|', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', '|', '.', '|', ' ', '|', ' ', ' ', ' ', '|', ' ', '|', '.', '|', ' ', ' ', ' ', ' '],
        ['1', '-', '-', '-', '3', '.', '_', ' ', '4', '-', 'z', '-', '3', ' ', '_', '.', '4', '-', '-', '-', '2'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['|', '.', '<', '-', '2', '.', '<', '-', '>', '.', '_', '.', '<', '-', '>', '.', '1', '-', '>', '.', '|'],
        ['|', 'p', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', '.', 'p', '|'],
        ['c', '-', '2', '.', '|', '.', '^', '.', '1', '-', '-', '-', '2', '.', '^', '.', '|', '.', '1', '-', 'x'],
        ['c', '-', '3', '.', '_', '.', '|', '.', '4', '-', 'z', '-', '3', '.', '|', '.', '_', '.', '4', '-', 'x'],
        ['|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|'],
        ['|', '.', '<', '-', '-', '-', 'v', '-', '>', '.', '_', '.', '<', '-', 'v', '-', '-', '-', '>', '.', '|'],
        ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
        ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
    ],
    respawnPoint: new Point(10, 12),
    ghostsSettings: [
        { 
            type: GhostType.Blinky,
            mode: GhostMode.Chase,
            startPosition: new Point(10, 10),
            startDirection: Direction.Right,
            delay: 400
        }, 
        { 
            type: GhostType.Pinky,
            mode: GhostMode.Chase,
            startPosition: new Point(10, 12),
            startDirection: Direction.Top,
            delay: 4000
        },
        { 
            type: GhostType.Inky,
            mode: GhostMode.Chase,
            startPosition: new Point(9, 12),
            startDirection: Direction.Top,
            delay: 7000
        },
        { 
            type: GhostType.Clyde,
            mode: GhostMode.Chase,
            startPosition: new Point(11, 12),
            startDirection: Direction.Top,
            delay: 9000
        }
    ]
}