import type { CMSAdapter } from '../types'
import { smilToScreenliteJson } from '../utils/smilJsonToScreenliteJson'

export class GarlicHubAdapter implements CMSAdapter {
    private cmsUrl: string
    private pollingInterval: number
    private intervalId: NodeJS.Timeout | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callback: ((state: any) => void) | null = null
    private etag: string | null = null
    private lastModified: string | null = null

    constructor(cmsUrl: string, pollingInterval: number = 10000) {
        this.cmsUrl = new URL(cmsUrl).origin
        this.pollingInterval = pollingInterval
    }

    private async fetchData() {
        const headers: Record<string, string> = {}

        if (this.etag) {
            headers['If-None-Match'] = this.etag
        } else if (this.lastModified) {
            headers['If-Modified-Since'] = this.lastModified
        }
		
        headers['X-Signage-Agent'] = 'GAPI/1.0 (UUID:15920d5d-7e68-4a61-a145-15b58b6d2090; NAME:Screenlite Web Test) screenlite-web/0.0.1 (MODEL:ScreenliteWeb)'

        const endpoint = `${this.cmsUrl}/smil-index`

        try {
            const response = await fetch(endpoint, { headers })

            if (response.status === 200) {
                const smilXml = await response.text()
                const data = smilToScreenliteJson(smilXml, this.cmsUrl)

                this.etag = response.headers.get('ETag')
                this.lastModified = response.headers.get('Last-Modified')
				
                try {
                    this.callback?.(data)
                } catch (callbackError) {
                    console.error('GarlicHubAdapter: Error in callback', callbackError)
                }
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
