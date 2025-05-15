import { useEffect, useState } from 'react'

// ONLY FOR TESTING PURPOSES
// This hook fetches the UTC time from an API, calculates the offset in milliseconds, and compensates for RTT
export const useTimeOffset = () => {
    const [offsetMs, setOffsetMs] = useState<number>(0)

    useEffect(() => {
        const fetchUtcTime = async () => {
            try {
                const start = Date.now()
                const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC')
                const end = Date.now()
                const data = await res.json()
                const utcTimestamp = new Date(data.dateTime).getTime()
                const localTimestamp = (start + end) / 2

                setOffsetMs(localTimestamp - utcTimestamp)
            } catch {
                setOffsetMs(0)
            }
        }

        fetchUtcTime()
    }, [])

    return offsetMs
}
