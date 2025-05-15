import { useEffect, useState } from 'react'

const REQUEST_COUNT = 5

export const useTimeOffset = () => {
    const [offsetMs, setOffsetMs] = useState<number>(0)

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null

        const fetchUtcTime = async () => {
            const offsets: number[] = []

            for (let i = 0; i < REQUEST_COUNT; i++) {
                try {
                    const start = performance.now()
                    const startDate = Date.now()
                    const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC')
                    const end = performance.now()
                    const data = await res.json()
                    const utcTimestamp = new Date(data.dateTime).getTime()

                    const networkDelay = (end - start) / 2
                    const estimatedLocalTime = startDate + networkDelay

                    offsets.push(estimatedLocalTime - utcTimestamp)
                } catch {
                    offsets.push(0)
                }
            }

            offsets.sort((a, b) => a - b)
            const trimmed = offsets.slice(1, -1)
            const avgOffset = trimmed.length
                ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
                : offsets.reduce((a, b) => a + b, 0) / offsets.length

            setOffsetMs(avgOffset)
        }

        fetchUtcTime()
        intervalId = setInterval(fetchUtcTime, 30000)

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [])

    return offsetMs
}