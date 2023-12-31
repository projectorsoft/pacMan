import { Asset, Color, GameMode, GameState, Timers } from "./enums.js"
import { Ghost } from "./ghost.js"
import { AssetsManager } from "./managers/assetsManager.js"
import { InputManager } from "./managers/inputManager.js"
import { MapManager } from "./managers/mapManager.js"
import { OnScreenControlsManager } from "./managers/onScreenControlsManager.js"
import { SoundsPlayer } from "./managers/soundsPlayer.js"
import { TimersManager } from "./managers/timersManager.js"
import { Placeholder, TranslationsService } from "./managers/translationsService.js"
import { Menu } from "./menu.js"
import { Player } from "./player.js"
import { Point } from "./point.js"
import { Wall } from "./wall.js"

export class Game {
    private readonly _fps: number = 60;

    private _canvas!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _mapManager!: MapManager;
    private _inputManger!: InputManager;
    private _assetsManager!: AssetsManager;
    private _timersManager!: TimersManager;
    private _onScreenControlsManager!: OnScreenControlsManager;
    private _soundsPlayer!: SoundsPlayer;
    private _translationsService!: TranslationsService;
    private _menu!: Menu;
    private _player!: Player;

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
        this.addAssets();
        this._assetsManager
            .loadAll()
            .then(() => {
                this.initialize();

                if (this.onGameLoaded) {
                    this.onGameLoaded(true);
                }
            })
            .catch((error: Error) => this.onGameLoaded(false, error.message));
    }

    public setScale(xScale: number, yScale: number): void {
        this._inputManger.setScale(xScale, yScale);
    }

    private initialize(): void {
        window.onblur = () => {
            if (this._gameMode === GameMode.Menu)
                return;

            this._timersManager.pause();
            this._soundsPlayer.audio.pause();
            this._stopped = true;
        };
        window.onfocus = () => {
            if (this._gameMode === GameMode.Menu)
                return;

            this._timersManager.resume();
            if (!this._soundsPlayer.audio.ended)
                this._soundsPlayer.audio.play();
            this._stopped = false;
        };

        this._inputManger = new InputManager();
        this._timersManager = new TimersManager();
        this._soundsPlayer = new SoundsPlayer(this._assetsManager);
        this._translationsService = new TranslationsService(this._assetsManager);
        this._mapManager = new MapManager(this._context, this._assetsManager, this._soundsPlayer, this._timersManager);
        this._onScreenControlsManager = new OnScreenControlsManager(this._context, this._inputManger, this._assetsManager);
        this._onScreenControlsManager.width = 80;
        this._onScreenControlsManager.height = 80;
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
        setTimeout(() => requestAnimationFrame(() => this.animate()), 1000 / this._fps);

        if (this._stopped)
            return;

        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = Color.Black;
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

        this._onScreenControlsManager.draw();

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

    private newGame(): void {
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
        this._mapManager.init();
        this._boardHeight = this._mapManager.currentMap.data.length * Wall.Height;
        this._boardWidth = this._mapManager.currentMap.data[0].length * Wall.Width;
        this._soundsPlayer.play(Asset.NewGameAudio);
        
        this._timersManager.addTimer(Timers.NewGame, () => {
            this._gameState = GameState.Play;
            this._pause = false;
            this._player.respawn();
            this._player.life = 3;
            this._player.score = 0;
            this._onScreenControlsManager.bindOnTouch();
            this._onScreenControlsManager.position = new Point(this._boardWidth, 270);
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
            /* if (this._mapManager.isLastMap()) {
                this.endGame(GameState.Finished);
                return;
            } */

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

    private addAssets(): void {
        this._assetsManager.addTranslationAsset(Asset.PlTranslations, `${AssetsManager.Path}assets/translations/pl.json`);
        this._assetsManager.addTranslationAsset(Asset.EnTranslations, `${AssetsManager.Path}assets/translations/en.json`);

        this._assetsManager.addImageAsset(Asset.LogoImg, `${AssetsManager.Path}assets/images/logo.png`);
        this._assetsManager.addImageAsset(Asset.WallsImg, `${AssetsManager.Path}assets/images/walls.png`);
        this._assetsManager.addImageAsset(Asset.GhostsImg, `${AssetsManager.Path}assets/images/ghosts.png`);
        this._assetsManager.addImageAsset(Asset.PlayerImg, `${AssetsManager.Path}assets/images/player.png`);
        this._assetsManager.addImageAsset(Asset.ArrowsImg, `${AssetsManager.Path}assets/images/arrows.png`);

        this._assetsManager.addAudioAsset(Asset.NewGameAudio, `${AssetsManager.Path}assets/sounds/newGame.wav`);
        this._assetsManager.addAudioAsset(Asset.ChompAudio, `${AssetsManager.Path}assets/sounds/chomp.wav`);
        this._assetsManager.addAudioAsset(Asset.DeathAudio, `${AssetsManager.Path}assets/sounds/death.wav`);
        this._assetsManager.addAudioAsset(Asset.PanicAudio, `${AssetsManager.Path}assets/sounds/panic.wav`);
        this._assetsManager.addAudioAsset(Asset.AlarmAudio, `${AssetsManager.Path}assets/sounds/alarm.wav`);
        this._assetsManager.addAudioAsset(Asset.RetreatingAudio, `${AssetsManager.Path}assets/sounds/retreating.wav`);
        this._assetsManager.addAudioAsset(Asset.GhostEatenAudio, `${AssetsManager.Path}assets/sounds/ghostEaten.wav`);

        this._assetsManager.addFontAsset(Asset.PixelCodeFont, `${AssetsManager.Path}assets/fonts/pixelCode.woff`);
    }
}
