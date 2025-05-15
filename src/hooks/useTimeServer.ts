import { useEffect, useRef, useState } from 'react'

type TimeServerMessage = {
	timestamp: number
}

export const useTimeServer = (url: string = 'ws://localhost:8080') => {
    const [timestamp, setTimestamp] = useState<number | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const ws = new window.WebSocket(url)

        wsRef.current = ws

        ws.onmessage = (event) => {
            try {
                const data: TimeServerMessage = JSON.parse(event.data)

                if (typeof data.timestamp === 'number') {
                    setTimestamp(data.timestamp)
                }
            } catch {
                console.log('Invalid message format:', event.data)
            }
        }

        return () => {
            ws.close()
        }
    }, [url])

    return timestamp
}