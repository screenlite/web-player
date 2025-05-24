import type { CMSAdapter } from '../types'
import { parseSmil } from '../utils/parseSmil'

export class GarlicHubAdapter implements CMSAdapter {
    private endpoint: string
    private pollingInterval: number
    private intervalId: NodeJS.Timeout | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callback: ((state: any) => void) | null = null
    private etag: string | null = null
    private lastModified: string | null = null

    constructor(endpoint: string, pollingInterval: number = 10000) {
        this.endpoint = endpoint
        this.pollingInterval = pollingInterval
    }

    private async fetchData() {
        const headers: Record<string, string> = {}

        if (this.etag) {
            headers['If-None-Match'] = this.etag
        } else if (this.lastModified) {
            headers['If-Modified-Since'] = this.lastModified
        }

        try {
            const response = await fetch(this.endpoint, { headers })

            if (response.status === 200) {
                const smilXml = await response.text()
                const data = parseSmil(smilXml)

                this.etag = response.headers.get('ETag')
                this.lastModified = response.headers.get('Last-Modified')
                this.callback?.(data)
            } else if (response.status === 304) {
                // No update needed
            } else {
                console.warn(`GarlicHubAdapter: Unexpected response status: ${response.status}`)
            }
        } catch (error) {
            console.error('GarlicHubAdapter: Failed to fetch data', error)
        }
    }

    connect() {
        this.fetchData()
        this.intervalId = setInterval(() => this.fetchData(), this.pollingInterval)
    }

    disconnect() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate(callback: (state: any) => void) {
        this.callback = callback
    }
}
