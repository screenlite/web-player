type TickCallback = (delta: number) => void

export class TickLoop {
    private callbacks = new Set<TickCallback>()
    private rafId = 0
    private lastTime = 0
    private _running = false

    start(): void {
        if (this._running) return
        this._running = true
        this.lastTime = performance.now()

        const tick = (time: number) => {
            const delta = time - this.lastTime
            this.lastTime = time
            this.callbacks.forEach(cb => cb(delta))
            this.rafId = requestAnimationFrame(tick)
        }

        this.rafId = requestAnimationFrame(tick)
    }

    stop(): void {
        this._running = false
        cancelAnimationFrame(this.rafId)
    }

    add(cb: TickCallback): () => void {
        this.callbacks.add(cb)
        return () => this.callbacks.delete(cb)
    }
}

export const tickLoop = new TickLoop()
