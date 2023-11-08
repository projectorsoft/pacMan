export class  Timeer {
    private _timerId: number = 0;
    private _startDate: Date = new Date();
    private _remaining: number;
    private _delay: number;

    public constructor(deleay: number) {
        this._delay = deleay;
        this._remaining = deleay;
    }

    public resume() {
        this._startDate = new Date();
        this._timerId = setTimeout(() => {
            this._remaining = this._delay;
        }, this._remaining);
    }
}