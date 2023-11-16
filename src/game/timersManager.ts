export class TimersManager {
    private _timers: { [name: string]: number | undefined } = {};

    public constructor() {
    }

    public addTimer(name: string, handler: Function, timeout: number, replace: boolean = false): void {
        if (this._timers[name] && !replace)
            return;

        if (this._timers[name] && replace)
            this.delete(name);

        const timerId = setTimeout(() => {
            this.delete(name);
            handler();
        }, timeout);
        this._timers[name] = timerId;
    }

    public addInterval(name: string, handler: Function, timeout: number): void {
        if (this._timers[name])
            return;

        const intervalId = setInterval(() => {
            handler();
        }, timeout);

        this._timers[name] = intervalId;
    }

    public delete(name: string): void {
        if (this._timers[name]) {
            clearTimeout(this._timers[name]);
            this._timers[name] = undefined;
        }
    }

    public exists(name: string): boolean {
        return this._timers[name] !== undefined;
    }

    public deleteAll(): void {
        //TODO
    }
}