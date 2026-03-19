type Listener<T> = (state: T, prev: T) => void

export class Observable<T extends object> {
    private _state: T
    private listeners = new Set<Listener<T>>()

    constructor(initial: T) {
        this._state = { ...initial }
    }

    get state(): Readonly<T> {
        return this._state
    }

    set(updater: Partial<T> | ((prev: T) => Partial<T>)): void {
        const patch = typeof updater === 'function' ? updater(this._state) : updater
        const prev = this._state
        this._state = { ...prev, ...patch }
        this.listeners.forEach(l => l(this._state, prev))
    }

    subscribe(listener: Listener<T>): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }
}
