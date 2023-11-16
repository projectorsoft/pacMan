export class  Timer {
    private _name: string;
    private _timerId: number = 0;
    private _startDate: Date = new Date();
    private _remaining: number;
    private _timeout: number;
    private _handler: Function;
    private _isInterval: boolean;

    public get timerId(): number {
        return this._timerId;
    }

    public constructor(name: string, handler: Function, timeout: number, isInterval: boolean = false) {
        this._name = name;
        this._handler = handler;
        this._timeout = timeout;
        this._remaining = timeout;
        this._isInterval = isInterval;

        this.start();
    }

    public pause(): void {
        clearTimeout(this._timerId);
        this._remaining -= new Date().getTime() - this._startDate.getTime();
        //console.log(this._name, this._remaining);
    }

    public start() {
        this._startDate = new Date();
        
        if (this._isInterval)
            this.createInterval();
        else
            this.createTimeout();
    }

    private createTimeout() {
        this._timerId = setTimeout(() => {
            this._remaining = this._timeout;
            this._handler();
        }, this._timeout);
    }

    private createInterval() {
        this._timerId = setInterval(() => {
            this._remaining = this._timeout;
            this._handler();
        }, this._timeout);
    }
}