import { Timer } from "../timer";

export class TimersManager {
    private _timers: { [name: string]: Timer | undefined } = {};

    public constructor() {
    }

    public addTimer(name: string, handler: Function, timeout: number, replace: boolean = false): void {
        if (this._timers[name] && !replace)
            return;

        if (this._timers[name] && replace)
            this.delete(name);

        this._timers[name] = new Timer(name, () => {
            this.delete(name);
            handler();
        }, timeout);
    }

    public addInterval(name: string, handler: Function, timeout: number): void {
        if (this._timers[name])
            return;

        this._timers[name] = new Timer(name, () => {
            handler();
        }, timeout, true);
    }

    public delete(name: string): void {
        if (this._timers[name]) {
            //console.log(name, 'deleted')
            clearTimeout(this._timers[name]?.timerId);
            this._timers[name] = undefined;
        }
    }

    public exists(name: string): boolean {
        return this._timers[name] !== undefined;
    }

    public pause(): void {
        Object.keys(this._timers).forEach(key => {
            if (this._timers[key]) {
                //console.log(`${key} paused`)
                this._timers[key]?.pause();
            }
        });
    }

    public resume(): void {
        Object.keys(this._timers).forEach(key => {
            if (this._timers[key]) {
                //console.log(`${key} started`)
                this._timers[key]?.start();
            }
        });
    }
}