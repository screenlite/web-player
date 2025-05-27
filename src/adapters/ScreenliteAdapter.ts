import type { CMSAdapter, InitDeviceInfo } from '../types'
import { io, Socket } from 'socket.io-client'
import { getDeviceTelemetry } from '../utils/getDeviceTelemetry'

export class ScreenliteAdapter implements CMSAdapter {
    private cmsUrl: string
    private socket: Socket | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private callback: ((state: any) => void) | null = null

    constructor(cmsUrl: string) {
        this.cmsUrl = new URL(cmsUrl).origin + '/devices'
    }

    connect() {
        this.socket = io(this.cmsUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        this.socket.on('connect', () => {
            this.onConnect(this.socket!)
        })

        this.socket.on('deviceState', (data: string) => {
            console.log(data)
            try {
                this.callback?.(data)
            } catch (err) {
                console.error('ScreenliteAdapter: Error parsing deviceState', err)
            }
        })

        this.socket.on('error', (err: unknown) => {
            console.error('ScreenliteAdapter: Socket error', err)
        })
    }
	
    async onConnect(socket: Socket) {
        const backendDeviceData = await getDeviceTelemetry()

        // const deviceStateString = localStorage.getItem('deviceState')

        // const deviceState = deviceStateString ? JSON.parse(deviceStateString) : {}

        socket.emit('deviceData', {
            ...backendDeviceData,
            token: 'bf2e3e3b15ff4e608a5bf3aa097b6d5d5fcef37b99f105c31e4153b1bd12aab8',
        } as InitDeviceInfo)
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate(callback: (state: any) => void) {
        this.callback = callback
    }
}
