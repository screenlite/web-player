import type { MediaItem } from '../types'

const ENABLE_PLAYBACK_TRACKER = import.meta.env.VITE_ENABLE_PLAYBACK_TRACKER === 'true'

export class MediaItemRenderer {
    el: HTMLImageElement | HTMLVideoElement
    private wasVisible = false
    private visibleTimestamp: string | null = null
    private hidden: boolean

    constructor(item: MediaItem) {
        this.hidden = item.hidden

        if (item.type === 'image') {
            const img = document.createElement('img')
            img.src = item.src
            this.el = img
        } else {
            const video = document.createElement('video')
            video.loop = true
            video.muted = true
            const source = document.createElement('source')
            source.src = item.src
            source.type = 'video/mp4'
            video.appendChild(source)
            this.el = video
        }

        Object.assign(this.el.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        })

        this.applyState(item)
    }

    update(item: MediaItem): void {
        const prevHidden = this.hidden
        this.hidden = item.hidden
        this.applyState(item)

        if (item.type === 'video') {
            const video = this.el as HTMLVideoElement
            if (item.hidden && !prevHidden) {
                video.pause()
                video.currentTime = 0
            } else if (!item.hidden && prevHidden) {
                video.play().catch(() => {})
            }
        }
    }

    private applyState(item: MediaItem): void {
        this.el.style.zIndex = item.hidden ? '0' : '1'
        this.trackPlayback(item.id, item.hidden)
    }

    private trackPlayback(id: string, hidden: boolean): void {
        if (!ENABLE_PLAYBACK_TRACKER) return

        if (!hidden && !this.wasVisible) {
            this.wasVisible = true
            this.visibleTimestamp = new Date().toISOString()
        } else if (hidden && this.wasVisible) {
            console.log('========================================')
            console.log('Media Item Playback Tracker')
            console.log('----------------------------------------')
            console.log(`Media item ID: "${id}"`)
            console.log(`Visible from: ${this.visibleTimestamp}`)
            console.log(`Hidden at: ${new Date().toISOString()}`)
            console.log('========================================')
            this.wasVisible = false
            this.visibleTimestamp = null
        }
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.el)
    }

    unmount(): void {
        this.el.remove()
    }
}
