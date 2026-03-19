import type { Playlist } from '../types'
import { SectionContainer } from './SectionContainer'
import { ElapsedDisplay } from './ElapsedDisplay'

export class PlaylistRenderer {
    el: HTMLDivElement
    private sections = new Map<string, SectionContainer>()
    private elapsedDisplay: ElapsedDisplay
    private canvas: HTMLDivElement

    constructor() {
        this.el = document.createElement('div')
        this.elapsedDisplay = new ElapsedDisplay()
        this.canvas = document.createElement('div')
        Object.assign(this.canvas.style, {
            background: 'black',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
        })
        this.el.appendChild(this.elapsedDisplay.el)
        this.el.appendChild(this.canvas)
    }

    update(playlist: Playlist, elapsedSinceStart: number, scale: number): void {
        this.elapsedDisplay.update(elapsedSinceStart / 1000)

        const ids = new Set<string>()
        for (const section of playlist.sections) {
            ids.add(section.id)
            if (!this.sections.has(section.id)) {
                const container = new SectionContainer()
                container.mount(this.canvas)
                this.sections.set(section.id, container)
            }
            this.sections.get(section.id)!.update(section, scale, elapsedSinceStart)
        }

        for (const [id, container] of this.sections) {
            if (!ids.has(id)) {
                container.unmount()
                this.sections.delete(id)
            }
        }
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.el)
    }

    unmount(): void {
        for (const container of this.sections.values()) {
            container.unmount()
        }
        this.sections.clear()
        this.el.remove()
    }
}
