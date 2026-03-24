import type { CMSAdapter, Playlist, Section, Item } from '../types'

const TOKEN_STORAGE_KEY = 'screenlite_playground_token'

interface PlaygroundPlaylistItemFile {
    id: string
    original_name: string
    filename: string
    mime_type: string
    type: 'image' | 'video' | 'audio'
}

interface PlaygroundPlaylistItem {
    id: string
    playlist_id: string
    title: string
    duration: number
    order_index: number
    file_id: string
    file: PlaygroundPlaylistItemFile
}

interface PlaygroundPlaylist {
    id: string
    name: string
    created_at: string
    items: PlaygroundPlaylistItem[]
}

function transformPlaylist(playlist: PlaygroundPlaylist, baseUrl: string): Playlist {
    const items: Item[] = playlist.items
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((item): Item => ({
            id: item.id,
            content_type: item.file.type,
            content_path: `${baseUrl}/uploads/${item.file.filename}`,
            duration: item.duration,
        }))

    const section: Section = {
        id: `section_${playlist.id}`,
        position: {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            z_index: 0,
        },
        items,
    }

    return {
        id: playlist.id,
        start_date: '2000-01-01',
        end_date: '2099-12-31',
        start_time: '00:00:00',
        end_time: '23:59:59',
        width: 1920,
        height: 1080,
        sections: [section],
    }
}

export class ScreenlitePlaygroundAdapter implements CMSAdapter {
    private baseUrl: string
    private ws: WebSocket | null = null
    private token: string | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callback: ((state: any) => void) | null = null
    private pingIntervalId: ReturnType<typeof setInterval> | null = null
    private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null
    private reconnectDelay = 1000
    private readonly maxReconnectDelay = 30000
    private destroyed = false

    constructor(cmsUrl: string) {
        this.baseUrl = new URL(cmsUrl).origin
        this.token = localStorage.getItem(TOKEN_STORAGE_KEY)
    }

    connect() {
        this.destroyed = false
        this.openSocket()
    }

    private openSocket() {
        const url = this.token
            ? `${this.baseUrl.replace(/^http/, 'ws')}/ws/screen?token=${this.token}`
            : `${this.baseUrl.replace(/^http/, 'ws')}/ws/screen`

        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
            this.reconnectDelay = 1000
            this.startPing()
        }

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const msg = JSON.parse(event.data as string)
                this.handleMessage(msg)
            } catch (err) {
                console.error('ScreenlitePlaygroundAdapter: Failed to parse message', err)
            }
        }

        this.ws.onerror = (err: Event) => {
            console.error('ScreenlitePlaygroundAdapter: WebSocket error', err)
        }

        this.ws.onclose = () => {
            this.stopPing()
            if (!this.destroyed) {
                this.scheduleReconnect()
            }
        }
    }

    private handleMessage(msg: { type: string; data?: unknown }) {
        if (msg.type === 'screen:auth') {
            const { screenId: _screenId, token } = msg.data as { screenId: string; token: string }
            this.token = token
            localStorage.setItem(TOKEN_STORAGE_KEY, token)
        } else if (msg.type === 'playlist:updated') {
            const playlist = msg.data as PlaygroundPlaylist
            const transformed = transformPlaylist(playlist, this.baseUrl)
            this.callback?.([transformed])
        }
    }

    private startPing() {
        this.stopPing()
        this.pingIntervalId = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }))
            }
        }, 30000)
    }

    private stopPing() {
        if (this.pingIntervalId !== null) {
            clearInterval(this.pingIntervalId)
            this.pingIntervalId = null
        }
    }

    private scheduleReconnect() {
        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = null
            this.openSocket()
        }, this.reconnectDelay)
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay)
    }

    disconnect() {
        this.destroyed = true
        this.stopPing()
        if (this.reconnectTimeoutId !== null) {
            clearTimeout(this.reconnectTimeoutId)
            this.reconnectTimeoutId = null
        }
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate(callback: (state: any) => void) {
        this.callback = callback
    }
}
