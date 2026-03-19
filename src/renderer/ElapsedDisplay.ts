export class ElapsedDisplay {
    el: HTMLDivElement

    constructor() {
        this.el = document.createElement('div')
        this.el.className = 'bg-black text-green-400 text-sm font-mono px-2 py-1 rounded shadow-md'
        Object.assign(this.el.style, {
            position: 'fixed',
            top: '8px',
            right: '8px',
            zIndex: '50',
        })
    }

    update(elapsedSeconds: number): void {
        this.el.textContent = `Elapsed: ${elapsedSeconds.toFixed(0)} sec`
    }
}
