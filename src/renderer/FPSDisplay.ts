import { tickLoop } from '../core/tick'

export class FPSDisplay {
    el: HTMLDivElement
    private frames = 0
    private elapsed = 0
    private cleanup: (() => void) | null = null

    constructor() {
        this.el = document.createElement('div')
        this.el.className = 'bg-black text-green-400 text-sm font-mono px-2 py-1 rounded shadow-md'
        Object.assign(this.el.style, {
            position: 'fixed',
            top: '8px',
            left: '8px',
            zIndex: '50',
        })
        this.el.textContent = 'FPS: 0'
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.el)
        this.cleanup = tickLoop.add((delta) => {
            this.frames++
            this.elapsed += delta
            if (this.elapsed >= 1000) {
                this.el.textContent = `FPS: ${this.frames}`
                this.frames = 0
                this.elapsed -= 1000
            }
        })
    }

    unmount(): void {
        this.cleanup?.()
        this.cleanup = null
        this.el.remove()
    }
}
