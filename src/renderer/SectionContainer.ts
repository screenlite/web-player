import type { Section, MediaItem } from '../types'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'
import { MediaItemRenderer } from './MediaItemRenderer'

export class SectionContainer {
    el: HTMLDivElement
    private renderers = new Map<string, MediaItemRenderer>()
    private mediaItems: MediaItem[] = []
    private totalDuration = 0
    private lastItemIds = ''

    constructor() {
        this.el = document.createElement('div')
        this.el.style.position = 'fixed'
        this.el.style.overflow = 'hidden'
    }

    update(section: Section, scale: number, elapsedSinceStart: number): void {
        this.el.style.left = `${Math.floor(section.position.x * scale)}px`
        this.el.style.top = `${Math.floor(section.position.y * scale)}px`
        this.el.style.width = `${Math.floor(section.position.width * scale)}px`
        this.el.style.height = `${Math.floor(section.position.height * scale)}px`
        this.el.style.zIndex = String(section.position.z_index)

        this.syncItems(section)

        const sequenceState = calculateMediaSequenceState(this.mediaItems, elapsedSinceStart, this.totalDuration)
        this.mediaItems = updateMediaItemsState(this.mediaItems, sequenceState)

        const activeIds = new Set<string>()
        for (const item of this.mediaItems) {
            activeIds.add(item.id)

            if (!item.preload && item.hidden) {
                if (this.renderers.has(item.id)) {
                    this.renderers.get(item.id)!.unmount()
                    this.renderers.delete(item.id)
                }
                continue
            }

            if (this.renderers.has(item.id)) {
                this.renderers.get(item.id)!.update(item)
            } else {
                const renderer = new MediaItemRenderer(item)
                renderer.mount(this.el)
                this.renderers.set(item.id, renderer)
            }
        }

        for (const [id, renderer] of this.renderers) {
            if (!activeIds.has(id)) {
                renderer.unmount()
                this.renderers.delete(id)
            }
        }
    }

    private syncItems(section: Section): void {
        const newIds = section.items.map(i => i.id).join(',')
        if (newIds === this.lastItemIds) return
        this.lastItemIds = newIds

        let items: MediaItem[] = section.items.map(item => ({
            id: item.id,
            src: item.content_path,
            type: item.content_type,
            duration: item.duration * 1000,
            hidden: true,
            preload: false,
        }))

        if (items.length === 1) {
            items = [...items, { ...items[0], id: `${items[0].id}-copy` }]
        }

        this.totalDuration = items.reduce((sum, item) => sum + item.duration, 0)
        this.mediaItems = items

        for (const renderer of this.renderers.values()) {
            renderer.unmount()
        }
        this.renderers.clear()
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.el)
    }

    unmount(): void {
        for (const renderer of this.renderers.values()) {
            renderer.unmount()
        }
        this.renderers.clear()
        this.el.remove()
    }
}
