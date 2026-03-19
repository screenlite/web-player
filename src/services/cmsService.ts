import type { CMSAdapter, Playlist } from '../types'

export class CMSService {
    private adapter: CMSAdapter | null = null
    onUpdate: ((playlists: Playlist[] | null) => void) | null = null

    connect(adapter: CMSAdapter): void {
        this.disconnect()
        this.adapter = adapter
        this.adapter.onUpdate((data: unknown) => {
            const playlists = Array.isArray(data) ? (data as Playlist[]) : null
            this.onUpdate?.(playlists)
        })
        this.adapter.connect()
    }

    disconnect(): void {
        this.adapter?.disconnect()
        this.adapter = null
    }
}

export const cmsService = new CMSService()
