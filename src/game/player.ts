import { ICircleBasedSprite } from "./IColidableObject.js";
import { Asset, Color, Keys } from "./enums.js";
import { Helpers } from "./helpers.js";
import { InputManager } from "./inputManager.js";
import { MapManager } from "./mapManager.js";
import { Point } from "./point.js";
import { SoundsPlayer } from "./soundsPlayer.js";
import { Wall } from "./wall.js";

export class Player implements ICircleBasedSprite {
    public static Velocity: number = 4;

    private _context: CanvasRenderingContext2D;
    private _position: Point;
    private _velocity: Point;
    private _radius: number = 18;
    private _radians: number = 0.75;
    private _chopeSpeed: number = 0.18;
    private _rotation: number = 0;
    private _isKilled: boolean = false;
    private _inputManager: InputManager;
    private _mapManager: MapManager;
    private _soundsPlayer: SoundsPlayer;

    get position(): Point {
        return this._position;
    }

    get velocity(): Point {
        return this._velocity;
    }

    set velocity(velocity: Point) {
        this._velocity = velocity;
    }

    get radius(): number {
        return this._radius;
    }

    get isKilled(): boolean {
        return this._isKilled;
    }

    set isKilled(value: boolean) {
        this._isKilled = value;

        this._soundsPlayer.play(Asset.DeathAudio);
    }
    
    constructor(
        context: CanvasRenderingContext2D,
        mapManager: MapManager,
        inputManager: InputManager,
        soundsPlayer: SoundsPlayer
    ) {
        this._context = context;
        this._position = new Point(Wall.Width + Wall.Width / 2, Wall.Height + Wall.Height / 2);
        this._velocity = new Point(0, 0);
        this._inputManager = inputManager;
        this._mapManager = mapManager;
        this._soundsPlayer = soundsPlayer;
    }

    public draw(): void {
        this._context.save();
        this._context.translate(this._position.x, this._position.y);
        this._context.rotate(this._rotation);
        this._context.translate(-this._position.x, -this._position.y);
        this._context.beginPath();
        this._context.arc(this._position.x, this._position.y, this._radius, this._radians, Math.PI * 2 - this._radians);
        this._context.lineTo(this._position.x, this._position.y)
        this._context.fillStyle = Color.Orange;
        this._context.fill();
        this._context.closePath();
        this._context.restore();
    }

    public update(): void {
        if (this._isKilled) {
            this._velocity.x = 0;
            this._velocity.y = 0;
            this.animateDie();
            return;
        }

        this.handleKeys();
        this.checkWallsCollision();

        this._position.x += this._velocity.x;
        this._position.y += this._velocity.y;

        if (this._position.x < 0)
            this._position.x = this._mapManager.currentMap.data[0].length * Wall.Width;
        else
        if (this._position.x > this._mapManager.currentMap.data[0].length * Wall.Width)
            this._position.x = 0;

        this.animateChomp();
    }

    public respawn(): void {
        this._isKilled = false;
        this._rotation = 0;
        this._radians = 0.5
        this._position.x = Wall.Width + Wall.Width / 2;
        this._position.y = Wall.Height + Wall.Height / 2;
        this._velocity = new Point(Player.Velocity, 0);
    }

    public setFull(): void {
        this._radians = 2 * Math.PI;
    }

    private handleKeys(): void {
        if (this._inputManager.isKeyPressed(Keys.Up) && this._inputManager.lastKey === Keys.Up) {
            for (let i = 0; i < this._mapManager.walls.length; i++) {
                const wall = this._mapManager.walls[i];

                if (Helpers.isColliding(this, wall, new Point(0, -Player.Velocity))) {
                    this._velocity.y = 0;
                    break;
                } else
                    this._velocity.y = -Player.Velocity;
            }
        } else if (this._inputManager.isKeyPressed(Keys.Left) && this._inputManager.lastKey === Keys.Left) {
            for (let i = 0; i < this._mapManager.walls.length; i++) {
                const wall = this._mapManager.walls[i];

                if (Helpers.isColliding(this, wall, new Point(-Player.Velocity, 0))) {
                    this._velocity.x = 0;
                    break;
                } else
                    this._velocity.x = -Player.Velocity;
            }
        } else if (this._inputManager.isKeyPressed(Keys.Down) && this._inputManager.lastKey === Keys.Down) {
            for (let i = 0; i < this._mapManager.walls.length; i++) {
                const wall = this._mapManager.walls[i];

                if (Helpers.isColliding(this, wall, new Point(0, Player.Velocity))) {
                    this._velocity.y = 0;
                    break;
                } else
                    this._velocity.y = Player.Velocity;
            }
        } else if (this._inputManager.isKeyPressed(Keys.Right) && this._inputManager.lastKey === Keys.Right) {
            for (let i = 0; i < this._mapManager.walls.length; i++) {
                const wall = this._mapManager.walls[i];

                if (Helpers.isColliding(this, wall, new Point(Player.Velocity, 0))) {
                    this._velocity.x = 0;
                    break;
                } else
                    this._velocity.x = Player.Velocity;
            }
        }
    }

    private checkWallsCollision(): void {
        this._mapManager.walls.forEach(wall => {
            if (Helpers.isColliding(
                this, wall, this.velocity
            )) {
                this._velocity.x = 0;
                this._velocity.y = 0;
            }
        });
    }

    private animateChomp(): void {
        if (this._velocity.x === 0 && this._velocity.y === 0) {
            this._radians = 0.5; //always open "mouth" when staying
            return;
        }

        if (this._radians < 0 || this._radians > 0.75)
            this._chopeSpeed = -this._chopeSpeed;

        this._radians += this._chopeSpeed;

        if (this._velocity.x > 0)
            this._rotation = 0;
        else if (this._velocity.x < 0)
            this._rotation = Math.PI;
        else if (this._velocity.y > 0)
            this._rotation = Math.PI / 2
        else if (this._velocity.y < 0)
            this._rotation = Math.PI * 1.5;
    }

    private animateDie(): void {
        if (this._radians >= 3) {
            setTimeout(() => this.respawn(), 150);
            return;
        }

        this._rotation = Math.PI * 1.5;
        this._radians += 0.1;
    }
}