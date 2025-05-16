import { useEffect, useRef, useState } from 'react'

type TimeServerMessage = {
	type: string
	timestamp?: number
	serverTime?: number
	serverPingTime?: number
}

export const useTimeServer = (url: string = 'ws://localhost:8080') => {
    const [timestamp, setTimestamp] = useState<number | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const ws = new window.WebSocket(url)

        wsRef.current = ws

        ws.onopen = () => {
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current)
                disconnectTimeoutRef.current = null
            }
        }

        ws.onmessage = (event) => {
            try {
                const data: TimeServerMessage = JSON.parse(event.data)

                if (data.type === 'ping' && typeof data.serverPingTime === 'number') {
                    ws.send(JSON.stringify({
                        type: 'pong',
                        serverPingTime: data.serverPingTime
                    }))
                }

                if (data.type === 'time' && typeof data.timestamp === 'number') {
                    setTimestamp(data.timestamp)
                }
            } catch {
                console.log('Invalid message format:', event.data)
            }
        }

        ws.onclose = () => {
            disconnectTimeoutRef.current = setTimeout(() => {
                setTimestamp(null)
            }, 10000)
        }

        return () => {
            ws.close()
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current)
                disconnectTimeoutRef.current = null
            }
        }
    }, [url])

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        if (timestamp !== null) {
            intervalRef.current = setInterval(() => {
                setTimestamp(prev => (prev !== null ? prev + 1 : null))
            }, 1000)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [timestamp])

    return timestamp
}