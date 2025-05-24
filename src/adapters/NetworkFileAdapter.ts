import type { CMSAdapter } from '../types'

export class NetworkFileAdapter implements CMSAdapter {
    private pollingInterval: number
    private intervalId: NodeJS.Timeout | null = null
    private fileUrl: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callback: ((state: any) => void) | null = null

    constructor(fileUrl: string, pollingInterval: number = 10000) {
        this.pollingInterval = pollingInterval
        this.fileUrl = fileUrl
    }

    private async fetchData() {
        try {
            const response = await fetch(this.fileUrl, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            })
            const contentType = response.headers.get('content-type')

            if (contentType && contentType.includes('application/json')) {
                const data = await response.json()

                this.callback?.(data)
            }
        } catch (error) {
            console.error('NetworkFileAdapter: Failed to fetch data', error)
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
