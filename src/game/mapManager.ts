import { AssetsManager } from "./assetsManager.js";
import { WallType } from "./enums.js";
import { Ghost } from "./ghost.js";
import { IMap } from "./maps/IMap.js";
import { map0 } from "./maps/map0.js";
import { map1 } from "./maps/map1.js";
import { map2 } from "./maps/map2.js";
import { Pellet } from "./pellet.js";
import { Point } from "./point.js";
import { PowerUp } from "./powerUp.js";
import { Wall } from "./wall.js";

export class MapManager {
    private _assetsManager: AssetsManager;
    private _context: CanvasRenderingContext2D;
    private _boundaries: Wall[] = [];
    private _pellets: Pellet[] = [];
    private _powerUps: PowerUp[] = [];
    private _ghosts: Ghost[] = [];
    private _maps: IMap[] = [];
    private _currentMap: IMap = this._maps[0];
    private _index: number = 0;

    get currentMap(): IMap {
        return this._currentMap;
    }

    get walls(): Wall[] {
        return this._boundaries;
    }

    get pellets(): Pellet[] {
        return this._pellets;
    }

    get powerUps(): PowerUp[] {
        return this._powerUps;
    }

    get ghosts(): Ghost[] {
        return this._ghosts;
    }

    constructor(context: CanvasRenderingContext2D,
        assetsManager: AssetsManager) {
        this._context = context;
        this._assetsManager = assetsManager;
        this._maps = [ map0, map1, map2 ]
        this.init();
    }

    public init(): void {
        this._index = 0;
        this._currentMap = this._maps[this._index];
        this.loadMap();
    }

    private loadMap(): void {
        this.clear();
        this._currentMap.data.forEach((row, i) => {
            row.forEach((symbol, j) => {
                switch (symbol) {
                    case '-':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.HorizontalLine));
                        break;
                    case '|':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.VerticalLine));
                        break;
                    case '1':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.CornerTL));
                        break;
                    case '2':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.CornerTR));
                        break;
                    case '3':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.CornerBR));
                        break;
                    case '4':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.CornerBL));
                        break;
                    case '<':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.TerminatorL));
                        break;
                    case '>':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.TerminatorR));
                        break;
                    case '^':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.TerminatorT));
                        break;
                    case '_':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.TerminatorB));
                        break;
                    case 'z':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.ConnectorT));
                        break;
                    case 'x':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.ConnectorR));
                        break;
                    case 'c':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.ConnectorL));
                        break;
                    case 'v':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.ConnectorB));
                        break;
                    case 'b':
                        this._boundaries.push(new Wall(this._context, this._assetsManager, new Point(j * Wall.Width, i * Wall.Height), WallType.Block));
                        break;
                    case '.':
                        this._pellets.push(new Pellet(this._context, new Point(j * Wall.Width + Wall.Width / 2, i * Wall.Height + Wall.Height / 2)));
                        break;
                    case 'p':
                        this._powerUps.push(new PowerUp(this._context, new Point(j * Wall.Width + Wall.Width / 2, i * Wall.Height + Wall.Height / 2)))
                        break;
                    case '~':
                        //TODO: draw breaking line
                        break;
                }
            })
        });

        this.createGhosts();
    }

    private createGhosts(): void {
        this._ghosts = this._currentMap.ghostsSettings.map(settings => new Ghost(
            this._context,
            this._assetsManager,
            new Point(settings.startPosition.x * Wall.Width + Wall.Width / 2, settings.startPosition.y * Wall.Height + Wall.Height / 2),
            new Point(0, -Ghost.Velocity),
            settings,
            this._currentMap
        ));
    }

    private clear(): void {
        this._boundaries.length = 0;
        this._pellets.length = 0;
        this._powerUps.length = 0;
        this.ghosts.length = 0;
    }

    public nextMap(): void {
        if (this._index + 1 < this._maps.length) {
            this._currentMap = this._maps[++this._index];
            this.loadMap();
        }
    }

    public isLastMap(): boolean {
        return this._index + 1 >= this._maps.length;
    }
}