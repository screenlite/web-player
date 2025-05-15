import { useEffect, useState } from 'react'

// This is a demo hook that fetches the UTC time from an API and calculates the offset in milliseconds
export const useTimeOffset = () => {
    const [offsetMs, setOffsetMs] = useState<number>(0)

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null
		
        const fetchUtcTime = async () => {
            try {
                const start = performance.now()
                const startDate = Date.now()
                const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC')
                const end = performance.now()
                const data = await res.json()
                const utcTimestamp = new Date(data.dateTime).getTime()

                const networkDelay = (end - start) / 2
                const estimatedLocalTime = startDate + networkDelay

                setOffsetMs(estimatedLocalTime - utcTimestamp)
            } catch {
                setOffsetMs(0)
            }
        }

        fetchUtcTime()
        intervalId = setInterval(fetchUtcTime, 30000)

        return () => clearInterval(intervalId)
    }, [])

    return offsetMs
}