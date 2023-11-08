import { AssetsManager } from "./assetsManager.js"
import { Asset, Color, GameMode, GameState, GhostMode, ScoreType } from "./enums.js"
import { Ghost } from "./ghost.js"
import { Helpers } from "./helpers.js"
import { InputManager } from "./inputManager.js"
import { Label } from "./label.js"
import { MapManager } from "./mapManager.js"
import { Menu } from "./menu.js"
import { Player } from "./player.js"
import { Point } from "./point.js"
import { SoundsPlayer } from "./soundsPlayer.js"
import { Placeholder, TranslationsService } from "./translationsService.js"
import { Wall } from "./wall.js"

export class Game {
    private readonly _fps: number = 25; //TODO: game time
    private readonly _locale: string = 'pl';
    private _translations = {};

    private _canvas!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _mapManager!: MapManager;
    private _inputManger!: InputManager;
    private _assetsManager!: AssetsManager;
    private _soundsPlayer!: SoundsPlayer;
    private _translationsService!: TranslationsService;
    private _player!: Player;

    private _gameMode: GameMode = GameMode.Menu;
    private _gameState: GameState = GameState.None;
    private _lives: number = 3;
    private _score: number = 0;
    private _highScore: number = 0;
    private _ghostsInPanic: boolean = false;
    private _pause: boolean = false
    private _stopped: boolean = false;
    private _boardWidth: number = 0;
    private _boardHeight: number = 0;

    private _scoreLabel!: Label;
    private _scoreValueLabel!: Label;
    private _highScoreLabel!: Label;
    private _highScoreValueLabel!: Label;

    private _menu!: Menu;

    public onGameLoaded!: (result: boolean, reason?: string) => void;

    public get pause(): boolean {
        return this._pause
    }
    public set pause(value: boolean) {
        this._pause = value

        if (value)
            this._soundsPlayer.audio.pause();
        else 
            this._soundsPlayer.audio.play();
    }

    constructor() {
        this._canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this._context = this._canvas.getContext('2d') as CanvasRenderingContext2D; 

        this.drawText('Loading assets...', new Point(window.innerWidth / 2, window.innerHeight / 2))

        this._assetsManager = new AssetsManager();
        this._assetsManager.loadAll()
        .then(() => {
            if (this.onGameLoaded)
                this.onGameLoaded(true);

            const pixelCodeFont = this._assetsManager.getFont(Asset.PixelCodeFont);
            document.fonts.add(pixelCodeFont);

            this.initialize();
        })
        .catch(() => this.onGameLoaded(false, 'One of assets not loaded correctly'));
    }

    private initialize(): void {
        window.onblur = () => { this._soundsPlayer.audio.pause(); this._stopped = true; }
        window.onfocus = () => { this._soundsPlayer.audio.play(); this._stopped = false; }

        this._mapManager = new MapManager(this._context, this._assetsManager);
        this._inputManger = new InputManager();
        this._soundsPlayer = new SoundsPlayer(this._assetsManager);
        this._translationsService = new TranslationsService(this._assetsManager);

        this._menu = new Menu(this._context, this._inputManger, this._assetsManager, this._translationsService);
        this._menu.onItemSelected = this.newGame.bind(this);
        this._menu.highScore = this._highScore;

        this._player = new Player(this._context, 
            this._mapManager,
            this._inputManger,
            this._soundsPlayer
        );

        this._highScoreLabel = new Label(this._context, new Point(640, 30), Color.Red);
        this._highScoreValueLabel = new Label(this._context, new Point(640, 70), Color.White);
        this._scoreLabel = new Label(this._context, new Point(640, 110), Color.Red);
        this._scoreValueLabel = new Label(this._context, new Point(640, 150), Color.White);

        this.animate();
    }

    private animate(): void {
        setTimeout(() => requestAnimationFrame(() => this.animate()), 
            1000 / this._fps);

        if (this._stopped)
            return;

        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        if (this._gameMode === GameMode.Menu) {
            this._soundsPlayer.audio.pause();
            this._menu.update();
            return;
        }

        this.play();
    }

    private play(): void {
        this._highScoreLabel.draw(this._translationsService.getTranslation('highScore', new Placeholder('score', '')));
        this._highScoreValueLabel.draw(`${this._highScore}`);
        this._scoreLabel.draw('1 UP');
        this._scoreValueLabel.draw(`${this._score}`);
        //lives
        for (let i = 0; i < this._lives; i++)
            this._context.drawImage(this._assetsManager.getImage(Asset.PlayerImg), 640 + i * 40, 240, 40, 40); //TODO: computed position based on map size

        this._mapManager.walls.forEach(wall => {
            wall.draw();
        });

        for (let i = this._mapManager.pellets.length - 1; 0 < i; i--) {
            const pellet = this._mapManager.pellets[i];
            pellet.draw();

            if (Helpers.hypot(pellet.position.x - this._player.position.x, pellet.position.y - this._player.position.y) < pellet.radius + this._player.radius) {
                this._mapManager.pellets.splice(i, 1);
                this._score += ScoreType.Pellet;
                this._soundsPlayer.play(Asset.ChompAudio);
            } else  {
                this._soundsPlayer.play(Asset.AlarmAudio);
            }
        }

        for (let i = this._mapManager.powerUps.length - 1; 0 <= i; i--) {
            const powerup = this._mapManager.powerUps[i];
            powerup.update();
            powerup.draw();

            if (Helpers.hypot(powerup.position.x - this._player.position.x, powerup.position.y - this._player.position.y) < powerup.radius + this._player.radius) {
                this._mapManager.powerUps.splice(i, 1);
                this._ghostsInPanic = true;
                this._score += ScoreType.PowerUp;
                this._soundsPlayer.play(Asset.PanicAudio);

                setTimeout(() => {
                    this._ghostsInPanic = false;
                    Ghost.GhostsEaten = 0;
                    this._soundsPlayer.play(Asset.AlarmAudio);
                }, 7000); 
            }
        }

        this._player.draw();

        for (let i = this._mapManager.ghosts.length - 1; 0 <= i; i--) {
            const ghost = this._mapManager.ghosts[i];

            if (this._ghostsInPanic) {
                if (ghost.mode !== GhostMode.Eaten && ghost.canBeFrightend)
                    ghost.mode = GhostMode.Frightend;
            } else {
                ghost.canBeFrightend = true;
                if (ghost.mode !== GhostMode.Eaten)
                    ghost.mode = GhostMode.Chase;
            }

            if (!this._pause && this._lives > 0) {
                ghost.move(this._mapManager.walls, this._mapManager.currentMap.respawnPoint, this._player);
                ghost.update();
            }

            ghost.draw();
            
            if (ghost.mode === GhostMode.Eaten)
                continue;

            if (!this._player.isKilled) {
                if (Helpers.hypot(ghost.position.x - this._player.position.x, ghost.position.y - this._player.position.y) < ghost.radius / 2 + this._player.radius / 2) {
                    if (ghost.mode === GhostMode.Frightend) {
                        this._score += ScoreType.Ghost;
                        ghost.mode = GhostMode.Eaten;
                        this._soundsPlayer.play(Asset.GhostEatenAudio);
                    } else if (ghost.mode === GhostMode.Chase) {
                        this._player.isKilled = true;
                        this._lives--;
                        break;
                    }
                }
            }
        }

        if (!this._pause && this._lives >= 0)
            this._player.update();

        this.checkGameState();
        this.drawGameState();
    }

    private newGame(): void {
        if (this._gameMode !== GameMode.Menu)
            return;

        this._pause = true;
        this._gameState = GameState.Ready;
        this._gameMode = GameMode.Play;
        this._boardHeight = this._mapManager.currentMap.data.length * Wall.Width;
        this._boardWidth = this._mapManager.currentMap.data[0].length * Wall.Height;
        this._mapManager.init();
        this._soundsPlayer.play(Asset.NewGameAudio);
        
        const id = setTimeout(() => {
            this._gameState = GameState.Play;
            this._pause = false;
            this._player.respawn();
            this._lives = 2;
            this._score = 0;
            clearTimeout(id);
        }, 4500);
    }

    //goes to main menu
    private endGame(gameState: GameState): void {
        if (this._pause)
            return;

        this._gameState = gameState;
        this._menu.reset();

        const id = setTimeout(() => {
            this._pause = true;
            this._mapManager.init();
            if (this._score > this._highScore)
                this._highScore = this._score;

            this._menu.highScore = this._highScore;

            Ghost.GhostsEaten = 0;
            
            this._gameMode = GameMode.Menu;
            this._gameState = GameState.None;
            this._player.respawn();
            clearTimeout(id);
        }, 1200);
    }

    private nextStage(): void {
        //PacMan close mouth 100%
        this._player.setFull();
        //Stop PacMan
        this._player.velocity = new Point(0, 0);
        //Ghosts disappear
        this._mapManager.ghosts.forEach(ghost => ghost.isHidden = true);

        if (this._pause)
            return;

        this._pause = true;
        this._boardHeight = this._mapManager.currentMap.data.length * Wall.Width;
        this._boardWidth = this._mapManager.currentMap.data[0].length * Wall.Height;

        //Wait 3 secs
        setTimeout(() => {
            this._mapManager.nextMap();
            this._mapManager.ghosts.forEach(ghost => {
                ghost.isHidden = false;
                ghost.restart();
            });
            this._player.respawn();
            this._pause = false;
        }, 3000);
    }

    private checkGameState(): void {
        this._mapManager.ghosts.forEach(ghost => {
            if (this._player.isKilled) {
                this._ghostsInPanic = false;
                ghost.restart();
            }
            else
                ghost.isHidden = false;
        });

        if (this._lives === 0) {
            this.endGame(GameState.GameOver);
            return;
        }

        if (this._mapManager.pellets.length - 1 === 0) {
            if (this._mapManager.isLastMap()) {
                this.endGame(GameState.Finished);
                return;
            }

            this.nextStage();
            return;
        }
    }

    private drawGameState(): void {
        const width: number = this._boardWidth / 2;
        const height: number = this._boardHeight / 2;

        switch (this._gameState) {
            case GameState.Ready:
                this.drawText(this._translationsService.getTranslation('player'), new Point(width, height - 75), Color.Blue);
                this.drawText(this._translationsService.getTranslation('ready'), new Point(width, height + 45), Color.Orange);
                break;
            case GameState.GameOver:
                this.drawText(this._translationsService.getTranslation('player'), new Point(width, height - 75), Color.Blue);
                this.drawText(this._translationsService.getTranslation('gameOver'), new Point(width, height + 45), Color.Red);
                break;
            case GameState.Finished:
                this.drawText(this._translationsService.getTranslation('player'), new Point(width, height - 75), Color.Blue);
                this.drawText(this._translationsService.getTranslation('won'), new Point(width, height + 45), Color.Green);
                break;
            case GameState.Play:
            case GameState.None:
                break;
        }
    }

    private drawText(text: string, position: Point, color: string = Color.White): void {
        this._context.font = '32px PixelCode';
        this._context.fillStyle = color;
        this._context.textAlign = 'center';
        this._context.fillText(text, position.x, position.y, 1000);
    }
}
