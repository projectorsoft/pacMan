import { ICircleBasedSprite } from "./IColidableObject.js";
import { Asset, Color, GhostMode, Keys, ScoreType, Timers } from "./enums.js";
import { Helpers } from "./helpers.js";
import { InputManager } from "./inputManager.js";
import { MapManager } from "./mapManager.js";
import { Pellet } from "./pellet.js";
import { Point } from "./point.js";
import { PowerUp } from "./powerUp.js";
import { SoundsPlayer } from "./soundsPlayer.js";
import { TimersManager } from "./timersManager.js";
import { Wall } from "./wall.js";

export class Player implements ICircleBasedSprite {
    public static Velocity: number = 3;

    private _context: CanvasRenderingContext2D;
    private _position: Point;
    private _velocity: Point;
    private _radius: number = 18;
    private _radians: number = 0.75;
    private _chopeSpeed: number = 0.18;
    private _rotation: number = 0;
    private _isKilled: boolean = false;
    private _isBusy: boolean = false;
    private _life: number = 3;
    private _score: number = 0;
    private _inputManager: InputManager;
    private _mapManager: MapManager;
    private _soundsPlayer: SoundsPlayer;
    private _timersManager: TimersManager;

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
        this._soundsPlayer.play(Asset.DeathAudio);
        this._isBusy = value;

        if (value) {
            this._velocity = new Point(0, 0);

            this._mapManager.ghosts.forEach(ghost => {
                ghost.velocity = new Point(0, 0);
            });

            this._timersManager.addTimer(Timers.BeforeDie, () => {
                this._mapManager.ghosts.forEach(ghost => {
                    ghost.restart();
                });
                this._isKilled = true;

                this._timersManager.addTimer(Timers.AfterDie, () => {
                    if (this._life > 0) {
                        this.respawn();
                        this._mapManager.ghosts.forEach(ghost => {
                            ghost.isHidden = false;
                        });
                    }
                }, 1400);
            }, 1000);
        }
    }

    public get life(): number {
        return this._life;
    }
    public set life(value: number) {
        this._life = value;
    }

    public get score(): number {
        return this._score;
    }
    public set score(value: number) {
        this._score = value;
    }
    
    constructor(
        context: CanvasRenderingContext2D,
        mapManager: MapManager,
        inputManager: InputManager,
        soundsPlayer: SoundsPlayer,
        timersManager: TimersManager
    ) {
        this._context = context;
        this._position = new Point(Wall.Width + Wall.Width / 2, Wall.Height + Wall.Height / 2);
        this._velocity = new Point(0, 0);
        this._inputManager = inputManager;
        this._mapManager = mapManager;
        this._soundsPlayer = soundsPlayer;
        this._timersManager = timersManager;
        this._score = 0;
        this._life = 3;
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

        const index = this.getMapIndex();

        this.handleKeys();
        this.checkWallsCollision();
        this.checkPelletCollision(index);
        this.checkPowerUpCollision(index);
        this.checkGhostCollison();

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
        this._isBusy = false;
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
        if (this._isBusy || this._isKilled)
            return;

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

    private checkPelletCollision(index: number): void {
        if (this._mapManager.pellets.has(index)) {
            const pellet = this._mapManager.pellets.get(index) as Pellet;
            if (Helpers.hypot(pellet.position.x - this.position.x, pellet.position.y - this.position.y) < pellet.radius + this.radius) {
                this._mapManager.pellets.delete(index);
                this.score += ScoreType.Pellet;
                this._soundsPlayer.play(Asset.ChompAudio);
            } else  {
                this._soundsPlayer.play(Asset.AlarmAudio);
            }
        }
    }

    private checkPowerUpCollision(index: number): void {
        if (this._mapManager.powerUps.has(index)) {
            const powerup = this._mapManager.powerUps.get(index) as PowerUp;

            if (Helpers.hypot(powerup.position.x - this.position.x, powerup.position.y - this.position.y) < powerup.radius + this.radius) {
                this._mapManager.powerUps.delete(index);
                this.score += ScoreType.PowerUp;
                this._mapManager.ghosts.forEach(ghost => {
                    if (ghost.mode !== GhostMode.Eaten)
                        ghost.mode = GhostMode.Frightend;
                });
                this._soundsPlayer.play(Asset.PanicAudio);
            }
        }
    }

    private checkGhostCollison(): void {
        if (!this._isBusy) {
            for (let i = this._mapManager.ghosts.length - 1; 0 <= i; i--) {
                const ghost = this._mapManager.ghosts[i];

                if (Helpers.hypot(ghost.position.x - this.position.x, ghost.position.y - this.position.y) < ghost.radius / 2 + this.radius / 2) {
                    if (ghost.mode === GhostMode.Frightend || ghost.mode === GhostMode.FrightendEnding) {
                        this.score += ScoreType.Ghost;
                        ghost.mode = GhostMode.Eaten;
                        this._soundsPlayer.play(Asset.GhostEatenAudio);
                    } else if (ghost.mode === GhostMode.Chase) {
                        this.isKilled = true;
                        this.life--;
                        break;
                    }
                }
            }
        }
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
        if (this._radians >= 3.1) {
            this._radians = 3.14;
            return;
        }

        this._rotation = Math.PI * 1.5;
        this._radians += 0.1;
    }

    private getMapIndex(): number {
        const x = Math.floor(this._position.x / Wall.Width);
        const y = Math.floor(this._position.y / Wall.Height);
        return x  + y * this._mapManager.currentMap.data[0].length;
    }
}