import { ICircleBasedSprite } from "./IColidableObject.js";
import { IGhostSettings } from "./IGhostSettings.js";
import { AssetsManager } from "./assetsManager.js";
import { Asset, Color, Direction, GhostMode, GhostType } from "./enums.js";
import { Helpers } from "./helpers.js";
import { IMap } from "./maps/IMap.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { SoundsPlayer } from "./soundsPlayer.js";
import { TimersManager } from "./timersManager.js";
import { Wall } from "./wall.js";

export class Ghost implements ICircleBasedSprite {
    public static Velocity: number = 4;
    public static GhostsEaten: number = 0;

    private _context: CanvasRenderingContext2D;
    private _settings: IGhostSettings;
    private _soundsPlayer: SoundsPlayer;
    private _timersManager: TimersManager;
    private _position: Point;
    private _velocity: Point;
    private _radius: number = 18;
    private _type: GhostType = GhostType.Blinky;
    private _mode: GhostMode = GhostMode.Chase;
    private _startPosition: Point = new Point(0, 0);
    private _delay: number = 400;
    private _isHidden: boolean = false;
    private _image: CanvasImageSource;
    private _animationGhostTypeIndex: number = 0;
    private _animationFrameIndex: number = 0;
    private _animationIndex: number = 0;
    private _animationFrameSize = 209;
    private _showScore: boolean = false;
    private _currentGhostEaten: number = 0;
    private _changeToOppositeDirection: boolean = false;
    private _minDstance: number = 999999;
    private _forceMoveRandomly: boolean = false;

    private _allDirections: Direction[] = [Direction.Left, Direction.Right, Direction.Top, Direction.Down];
    private _currentDirection: number = Direction.Top;
    private _prevDirections: Direction[] = [];

    private readonly _randomMovemntTime: number = 10000; //set after respawn to give player time
    private readonly _size: number = 35;
    private readonly _score: number = 200;
    private readonly _mapSize: number;

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

    get type(): GhostType {
        return this._type;
    }

    set isHidden(isHidden: boolean) {
        if (!isHidden && this._isHidden) {
            this._timersManager.addTimer(`${this._type}_respawn`, () => {
                this._velocity = new Point(0, -Ghost.Velocity);
                this.setRandomMovemntTimeout();
            }, this._delay, true);
        }

        this._isHidden = isHidden;
    }

    get mode(): GhostMode {
        return this._mode;
    }

    set mode(mode: GhostMode) {
        this._mode = mode;

        switch (mode) {
            case GhostMode.Eaten: {
                    if (this._timersManager.exists(`${this._type}_${GhostMode.Frightend}`)) {
                        this._timersManager.delete(`${this._type}_${GhostMode.Frightend}`);
                    }

                    this._currentGhostEaten = Ghost.GhostsEaten++;
                    this._showScore = true;
                    const currentVelocity = this._velocity;
                    this._velocity = new Point(0, 0);

                    this._timersManager.addTimer(`${this._type}_${this.mode}`, () => {
                        this._showScore = false;
                        this._velocity = currentVelocity;
                    }, 1500);
                }
                break;
            case GhostMode.Frightend: {
                    this._changeToOppositeDirection = true;

                    //situation when next power up has been eaten and previous one is still ticking
                    if (this._timersManager.exists(`${this._type}_${this.mode}`)) {
                        this._timersManager.delete(`${this._type}_${this.mode}`);
                    }

                    let counter: number = 0;
                    this._timersManager.addInterval(`${this._type}_${GhostMode.Frightend}`, () => {
                        counter = counter + 1;
                        if (counter === 12 || counter === 14 || counter === 16 || counter === 18 || counter === 20)
                            this._mode = GhostMode.FrightendEnding;
                        else
                            this._mode = GhostMode.Frightend;

                        if(counter === 21) {
                            this._timersManager.delete(`${this._type}_${GhostMode.Frightend}`);
                            Ghost.GhostsEaten = 0;
                            this._soundsPlayer.play(Asset.AlarmAudio);
                                this._mode = GhostMode.Chase;
                        }
                    }, 500);
                }
                break;
            case GhostMode.Chase:
                break;
        }
    }

    constructor(
        context: CanvasRenderingContext2D,
        assetsManager: AssetsManager,
        soundsPlayer: SoundsPlayer,
        timersManager: TimersManager,
        position: Point,
        velocity: Point,
        settings: IGhostSettings,
        map: IMap
    ) {
        this._context = context;
        this._soundsPlayer = soundsPlayer;
        this._timersManager = timersManager;
        this._position = position;
        this._velocity = new Point(0, 0);
        this._settings = settings;

        this.setDefaultProperties();
        this.setGhostType();
        this._image = assetsManager.getImage(Asset.GhostsImg);
        this._mapSize = map.data[0].length;

        this._timersManager.addTimer(`${this._type}_respawn`, () => {
            this._velocity = velocity;
            this.setRandomMovemntTimeout();
        }, settings.delay, true);
    }

    public draw(): void {
        if (this._isHidden)
            return;

        this._context.beginPath();
        
        if (this._showScore) {
            this._context.font = '28px PixelCode';
            this._context.fillStyle = Color.White;
            this._context.fillText(`${ this._score * Math.pow(2, this._currentGhostEaten) }`, this._position.x - 15, this._position.y);

            return;
        }

        this._context.drawImage(this._image, 
            this._animationIndex * this._animationFrameSize, 
            this._animationGhostTypeIndex * this._animationFrameSize, 
            this._animationFrameSize, 
            this._animationFrameSize,
            this._position.x - 15, 
            this._position.y - 15,
            this._size, 
            this._size
        );

        /* this._context.font = '12px Georgia';
        this._context.fillStyle = '#fff';
        this._context.fillText(`(${ this._forceMoveRandomly } )`, this._position.x - 15, this._position.y - 20); */

        this._context.closePath();
    }

    public update(): void {
        if (this._isHidden)
            return;

        switch(this._mode) {
            case GhostMode.Chase:
                this._animationIndex = this._currentDirection * 2;
                this.setGhostType();
                this.updateAnimationMovement();
                break;
            case GhostMode.Frightend:
                this._animationGhostTypeIndex = 4;
                this._animationIndex = 0;
                this.updateAnimationMovement();
                break;
            case GhostMode.FrightendEnding:
                this._animationGhostTypeIndex = 4;
                this._animationIndex = 2;
                this.updateAnimationMovement();
                break;
            case GhostMode.Eaten:
                this._animationGhostTypeIndex = 5;
                this._animationIndex = this._currentDirection;
                break;
        }

        if (this._velocity.x === 0 && this._velocity.y === 0)
            return;

        this._position.x += this._velocity.x;
        this._position.y += this._velocity.y;

        if (this._position.x < 0)
            this._position.x = this._mapSize * Wall.Width;
        else
        if (this._position.x > this._mapSize * Wall.Width)
            this._position.x = 0;

        this.adjustPosition();
    }

    private adjustPosition(): void {
        //needed to set always the same 'padding' between edge of Wall and ghost
        //and avoid unpredictable movment behaviour
        if (this.velocity.y !== 0) {
            const xPos = Math.floor(this._position.x % Wall.Width);
            if (xPos > Wall.Width / 2)
                this._position.x -= (xPos - Wall.Width / 2);
            else if (xPos < Wall.Width / 2)
                this._position.x += (Wall.Width / 2 - xPos);
        }

        if (this.velocity.x !== 0){
            const yPos = Math.floor(this._position.y % Wall.Height);
            if (yPos > Wall.Height / 2)
                this._position.y -= (yPos - Wall.Height / 2);
            else if (yPos < Wall.Height / 2)
                this._position.y += (Wall.Height / 2 - yPos);
        }
    }

    private updateAnimationMovement(): void {
        //needed to slow down ghost "waking" effect
        this._animationFrameIndex++;
        if (this._animationFrameIndex % 5 === 0)
            this._animationIndex++;
    }

    public move(walls: Wall[], respawnPoint: Point, player: Player): void {
        if (this._isHidden)
            return;

        if (this._velocity.x === 0 && this._velocity.y === 0)
            return;

        const collisions: Direction[] = [];
        const velocityFactor = this.getVelocityByMode();

        for (let i = 0; i < walls.length; i++) {
            const wall = walls[i];

            if (!collisions.includes(Direction.Down) && 
                Helpers.isColliding(this, wall, new Point(0, velocityFactor ))) {
                    collisions.push(Direction.Down);
            }
            if (!collisions.includes(Direction.Top) &&
                Helpers.isColliding(this, wall, new Point(0, -velocityFactor ))) {
                    collisions.push(Direction.Top);
            }
            if (!collisions.includes(Direction.Right) && 
                Helpers.isColliding(this, wall, new Point(velocityFactor, 0))) {
                    collisions.push(Direction.Right);
            }
            if (!collisions.includes(Direction.Left) && 
                Helpers.isColliding(this, wall, new Point(-velocityFactor, 0))) {
                    collisions.push(Direction.Left);
            }
        }

        const possibleDirections = this._allDirections.filter(direction => {
            return !collisions.includes(direction);
        });

        switch (this._mode) {
            case GhostMode.Chase:
                if (this._forceMoveRandomly) {
                    this.moveRandomly(possibleDirections, velocityFactor);
                    break;
                }

                if (this._type === GhostType.Blinky) {
                    const playerPoint = new Point(player.position.x / Wall.Width, player.position.y / Wall.Height);
                    this.moveToPoint(possibleDirections, playerPoint, velocityFactor);
                }
                else 
                if (this._type === GhostType.Pinky || this._type === GhostType.Clyde) {
                    const playerPoint = new Point(player.position.x / Wall.Width, player.position.y / Wall.Height);
                    const direction = this.getDirection(player.velocity);

                    switch (direction) {
                        case Direction.Left:
                            playerPoint.x = playerPoint.x - 2;
                            break;
                        case Direction.Right:
                            playerPoint.x = playerPoint.x + 2;
                            break;
                        case Direction.Top:
                            playerPoint.y = playerPoint.y - 2;
                            break;
                        case Direction.Down:
                            playerPoint.y = playerPoint.y + 2;
                            break;
                        default:
                            break;
                    }

                    this.moveToPoint(possibleDirections, playerPoint, velocityFactor);
                }
                else 
                    this.moveRandomly(possibleDirections, velocityFactor);
                break;
            case GhostMode.Frightend:
            case GhostMode.FrightendEnding:
                this.moveRandomly(possibleDirections, velocityFactor);
                break;
            case GhostMode.Eaten:
                this.moveToPoint(possibleDirections, respawnPoint, velocityFactor);
                if (this._minDstance < Wall.Width)
                    this.respawn(respawnPoint);
                break;
        }

        this.updateVelocity(this._currentDirection, velocityFactor);
    }

    private moveToPoint(possibleDirections: Direction[], point: Point, velocityFactor: number): void {
        if (!possibleDirections.includes(this._currentDirection) ||
            possibleDirections.length !== this._prevDirections.length) {
            this._prevDirections = possibleDirections;

            const oppositDirection = this.getOppositDirection(this._currentDirection);
            possibleDirections = possibleDirections.filter(direction => direction !== oppositDirection);
            
            if (possibleDirections.length > 0) {
                this._currentDirection = possibleDirections[0];
                possibleDirections.forEach(direction => {
                    const velocity = this.getVelocityByDirection(direction, velocityFactor);
                    const x = point.x * Wall.Width - this.position.x - velocity.x;
                    const y = point.y * Wall.Height - this.position.y - velocity.y;

                    const distance = Helpers.hypot(x, y);

                    if (distance < this._minDstance) {
                        this._minDstance = distance;
                        this._currentDirection = direction;
                    }
                });
            } else {
                this._currentDirection = oppositDirection;
                this._prevDirections = [];
            }
        } else {
            this._minDstance = 999999;
        }
    }

    private moveRandomly(possibleDirections: Direction[], velocityFactor: number): void {
        if (!possibleDirections.includes(this._currentDirection) ||
            possibleDirections.length !== this._prevDirections.length) {
                this._prevDirections = possibleDirections;
                const oppositDirection = this.getOppositDirection(this._currentDirection);
                possibleDirections = possibleDirections.filter(direction => direction !== oppositDirection);
                
                if (possibleDirections.length > 0) {
                    const index = Math.floor(Math.random() * possibleDirections.length);
                    this._currentDirection = possibleDirections[index];
                } else {
                    this._currentDirection = oppositDirection;
                    //this._prevDirections = [];
                }

                this.updateVelocity(this._currentDirection, velocityFactor);
        }
    }

    //when eaten by PacMan
    public respawn(respawnPoint: Point): void {
        this.setRandomMovemntTimeout();
        this.setDefaultProperties();
        this._velocity = new Point(0, -Ghost.Velocity);
        this._position.x = Wall.Width * respawnPoint.x + Wall.Width / 2;
        this._position.y = Wall.Height * respawnPoint.y + Wall.Height / 2;
    }

    //when PacMan eaten by Ghost
    public restart(): void {
        if (this._timersManager.exists(`${this._type}_${GhostMode.Frightend}`)) {
            this._timersManager.delete(`${this._type}_${GhostMode.Frightend}`);
        }

        this._isHidden = true;
        this._velocity = new Point(0, 0);

        this.setDefaultProperties();
        this._position.x = Wall.Width * this._startPosition.x + Wall.Width / 2;
        this._position.y = Wall.Height * this._startPosition.y + Wall.Height / 2;
    }

    private setDefaultProperties(): void {
        this._type = this._settings.type;
        this._mode = this._settings.mode;
        this._startPosition = this._settings.startPosition;
        this._currentDirection = this._settings.startDirection;
        this._delay = this._settings.delay;

        this._prevDirections = [];
        this._minDstance = 999999;
    }

    private setGhostType(): void {
        switch(this._type) {
            case GhostType.Blinky:
                this._animationGhostTypeIndex = 0;
                break;
            case GhostType.Pinky:
                this._animationGhostTypeIndex = 3;
                break;
            case GhostType.Inky:
                this._animationGhostTypeIndex = 1;
                break;
            case GhostType.Clyde:
                this._animationGhostTypeIndex = 2;
                break;
        }
    }

    private getVelocityByMode(): number {
        switch(this._mode) {
            case GhostMode.Chase:
                return Ghost.Velocity;
            case GhostMode.Frightend:
            case GhostMode.FrightendEnding:
                return Ghost.Velocity - 2;
            case GhostMode.Eaten:
                return Ghost.Velocity + 5;
            default: throw `Not supported ghodt mode ${this._mode}`;
        }
    }

    private getVelocityByDirection(direction: Direction, velocity: number): Point {
        switch (direction) {
            case Direction.Left:
                return new Point(-velocity, 0);
            case Direction.Right:
                return new Point(velocity, 0);
            case Direction.Top:
                return new Point(0, -velocity);
            case Direction.Down:
                return new Point(0, velocity);
            default: throw `Not supported direction ${direction}!`;
        }
    }

    private getDirection(velocity: Point): Direction | null {
        if (velocity.x < 0 && velocity.y === 0)
            return Direction.Left;

        if (velocity.x > 0 && velocity.y === 0)
            return Direction.Right;

        if (velocity.y < 0 && velocity.x === 0)
            return Direction.Down;

        if (velocity.y > 0 && velocity.x === 0)
            return Direction.Top;

        return null;
    }

    private getOppositDirection(direction: Direction): Direction {
        switch (direction) {
            case Direction.Left:
                return Direction.Right;
            case Direction.Right:
                return Direction.Left;
            case Direction.Top:
                return Direction.Down;
            case Direction.Down:
                return Direction.Top;
            default: 
                throw `Not supported direction ${direction}!`;
        }
    }

    private updateVelocity(direction: Direction, velocityFactor: number): void {
        switch (direction) {
            case Direction.Left:
                this._velocity.x = -velocityFactor;
                this._velocity.y = 0;
                break;
            case Direction.Right:
                this._velocity.x = velocityFactor;
                this._velocity.y = 0;
                break;
            case Direction.Top:
                this._velocity.x = 0;
                this._velocity.y = -velocityFactor;
                break;
            case Direction.Down:
                this._velocity.x = 0;
                this._velocity.y = velocityFactor;
                break;
        }
    }

    private setRandomMovemntTimeout(): void {
        this._forceMoveRandomly = true;
        this._timersManager.addTimer(`${this._type}_randomMovement`, () => this._forceMoveRandomly = false, this._randomMovemntTime, true);
    }
}