import type { Playlist } from '../types'
import { getActivePlaylist } from '../utils/getActivePlaylist'
import { PlaylistRenderer } from './PlaylistRenderer'

function calcScale(playlist: Playlist): number {
    const scaleX = window.innerWidth / playlist.width
    const scaleY = window.innerHeight / playlist.height
    return Math.min(scaleX, scaleY)
}

export class Player {
    el: HTMLDivElement
    private playlistRenderer: PlaylistRenderer | null = null
    private messageEl: HTMLDivElement
    private lastPlaylistId: string | null = null

    constructor() {
        this.el = document.createElement('div')

        this.messageEl = document.createElement('div')
        Object.assign(this.messageEl.style, {
            background: 'black',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
        })
        const h1 = document.createElement('h1')
        Object.assign(h1.style, { color: 'white', fontSize: '1.875rem', fontWeight: 'bold' })
        h1.textContent = 'No active playlist'
        this.messageEl.appendChild(h1)
    }

    update(playlists: Playlist[], currentTimestamp: number): void {
        const { activePlaylist, startTimestamp } = getActivePlaylist(playlists, currentTimestamp)
        const elapsedSinceStart =
            activePlaylist && startTimestamp != null ? currentTimestamp - startTimestamp : null

        if (!activePlaylist || elapsedSinceStart === null) {
            this.showMessage()
            return
        }

        if (this.lastPlaylistId !== activePlaylist.id) {
            this.lastPlaylistId = activePlaylist.id
            if (!this.playlistRenderer) {
                this.playlistRenderer = new PlaylistRenderer()
            }
            this.showPlaylist()
        }

        if (this.playlistRenderer) {
            const scale = calcScale(activePlaylist)
            this.playlistRenderer.update(activePlaylist, elapsedSinceStart, scale)
        }
    }

    private showMessage(): void {
        this.playlistRenderer?.el.remove()
        if (!this.messageEl.parentElement) {
            this.el.appendChild(this.messageEl)
        }
    }

    private showPlaylist(): void {
        this.messageEl.remove()
        if (this.playlistRenderer && !this.playlistRenderer.el.parentElement) {
            this.el.appendChild(this.playlistRenderer.el)
        }
    }

    mount(parent: HTMLElement): void {
        parent.appendChild(this.el)
    }

    unmount(): void {
        this.playlistRenderer?.unmount()
        this.el.remove()
    }
}
