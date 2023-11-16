import { AssetsManager } from "./assetsManager.js"
import { Asset, Color, GameMode, GameState, Timers } from "./enums.js"
import { Ghost } from "./ghost.js"
import { InputManager } from "./inputManager.js"
import { MapManager } from "./mapManager.js"
import { Menu } from "./menu.js"
import { Player } from "./player.js"
import { Point } from "./point.js"
import { SoundsPlayer } from "./soundsPlayer.js"
import { TimersManager } from "./timersManager.js"
import { Placeholder, TranslationsService } from "./translationsService.js"
import { Wall } from "./wall.js"

export class Game {
    private readonly _fps: number = 25; //TODO: game time

    private _canvas!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _mapManager!: MapManager;
    private _inputManger!: InputManager;
    private _assetsManager!: AssetsManager;
    private _timersManager!: TimersManager;
    private _soundsPlayer!: SoundsPlayer;
    private _translationsService!: TranslationsService;
    private _menu!: Menu;
    private _player!: Player;
    //private _currentPlayer: number = 0;

    private _gameMode: GameMode = GameMode.Menu;
    private _gameState: GameState = GameState.None;
    private _highScore: number = 0;
    private _pause: boolean = false
    private _stopped: boolean = false;
    private _boardWidth: number = 0;
    private _boardHeight: number = 0;

    public onGameLoaded!: (result: boolean, reason?: string) => void;

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
        window.onblur = () => {
            if (this._gameMode === GameMode.Menu)
                return;

            this._soundsPlayer.audio.pause();
            this._stopped = true;
        };
        window.onfocus = () => {
            if (this._gameMode === GameMode.Menu)
                return;

            this._soundsPlayer.audio.play();
            this._stopped = false;
        };

        this._inputManger = new InputManager();
        this._timersManager = new TimersManager();
        this._soundsPlayer = new SoundsPlayer(this._assetsManager);
        this._translationsService = new TranslationsService(this._assetsManager);
        this._mapManager = new MapManager(this._context, this._assetsManager, this._soundsPlayer, this._timersManager);
        this._player = new Player(
            this._context, 
            this._mapManager,
            this._inputManger,
            this._soundsPlayer,
            this._timersManager
        );
        this._menu = new Menu(this._context, this._inputManger, this._assetsManager, this._translationsService, this._canvas.width, this._canvas.height);
        this._menu.onItemSelected = this.newGame.bind(this);
        this._menu.highScore = this._highScore;

        this.animate();
    }

    private animate(): void {
        setTimeout(() => requestAnimationFrame(() => this.animate()), 
            1000 / this._fps);

        if (this._stopped)
            return;

        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = 'black';
        this._context.rect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fill();

        if (this._gameMode === GameMode.Menu) {
            this._soundsPlayer.audio.pause();
            this._menu.update();
            return;
        }

        this.play();
    }

    private play(): void {
        this.drawText(this._translationsService.getTranslation('highScore', new Placeholder('score', '')), new Point(this._boardWidth, 40), Color.Red, 'left');
        this.drawText(`${this._highScore}`, new Point(this._boardWidth, 80), Color.White, 'left');
        this.drawText('1 UP', new Point(this._boardWidth, 120), Color.Red, 'left');
        this.drawText(`${this._player.score}`, new Point(this._boardWidth, 160), Color.White, 'left');

        //life
        for (let i = 0; i < this._player.life; i++) {
            const image = this._assetsManager.getImage(Asset.PlayerImg);
            this._context.drawImage(image, this._boardWidth + i * image.width, 180, image.width, image.width);
        }

        this._mapManager.walls.forEach(wall => {
            wall.draw();
        });

        this._mapManager.pellets.forEach(pellet => {
            pellet.draw();
        });

        this._mapManager.powerUps.forEach(powerUp => {
            powerUp.update();
            powerUp.draw();
        });

        this._player.draw();

        for (let i = this._mapManager.ghosts.length - 1; 0 <= i; i--) {
            const ghost = this._mapManager.ghosts[i];

            if (!this._pause && this._player.life > 0) {
                ghost.move(this._mapManager.walls, this._mapManager.currentMap.respawnPoint, this._player);
                ghost.update();
            }

            ghost.draw();
        }

        if (!this._pause && this._player.life >= 0)
            this._player.update();

        this.checkGameState();
        this.drawGameState();
    }

    private newGame(twoPlayersMode: boolean): void {
        if (this._gameMode !== GameMode.Menu)
            return;

        this._player = new Player(this._context, 
            this._mapManager,
            this._inputManger,
            this._soundsPlayer,
            this._timersManager
        );

        this._pause = true;
        this._gameState = GameState.Ready;
        this._gameMode = GameMode.Play;
        this._boardHeight = this._mapManager.currentMap.data.length * Wall.Width;
        this._boardWidth = this._mapManager.currentMap.data[0].length * Wall.Height;
        this._mapManager.init();
        this._soundsPlayer.play(Asset.NewGameAudio);
        
        this._timersManager.addTimer(Timers.NewGame, () => {
            this._gameState = GameState.Play;
            this._pause = false;
            this._player.respawn();
            this._player.life = 3;
            this._player.score = 0;
        }, 4500);
    }

    //goes to main menu
    private endGame(gameState: GameState): void {
        if (this._pause)
            return;

        this._gameState = gameState;
        this._menu.reset();
        this._pause = true;

        this._timersManager.addTimer(Timers.EndGame, () => {
            this._pause = true;
            this._mapManager.init();
            if (this._player.score > this._highScore)
                this._highScore = this._player.score;

            this._menu.highScore = this._highScore;

            Ghost.GhostsEaten = 0;
            
            this._gameMode = GameMode.Menu;
            this._gameState = GameState.None;
            this._player.respawn();
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

        //Wait 3 secs
        this._timersManager.addTimer(Timers.NextStage, () => {
            this._mapManager.nextMap();
            this._boardHeight = this._mapManager.currentMap.data.length * Wall.Width;
            this._boardWidth = this._mapManager.currentMap.data[0].length * Wall.Height;
            this._mapManager.ghosts.forEach(ghost => {
                ghost.restart();
                ghost.isHidden = false;
            });
            this._player.respawn();
            this._pause = false;
        }, 3000);
    }

    private checkGameState(): void {
        if (this._timersManager.exists(Timers.BeforeDie) || 
            this._timersManager.exists(Timers.AfterDie))
            return;

        if (this._player.life === 0) {
            this.endGame(GameState.GameOver);
            return;
        }

        if (this._mapManager.pellets.size === 0) {
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

    private drawText(text: string, position: Point, color: string = Color.White, align: CanvasTextAlign = 'center'): void {
        this._context.font = '32px PixelCode';
        this._context.fillStyle = color;
        this._context.textAlign = align;
        this._context.fillText(text, position.x, position.y, 1000);
    }
}
