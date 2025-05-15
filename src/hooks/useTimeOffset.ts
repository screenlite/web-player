import { useEffect, useState } from 'react'

// This is a demo hook that fetches the UTC time from an API and calculates the offset in milliseconds
export const useTimeOffset = () => {
    const [offsetMs, setOffsetMs] = useState<number>(0)

    useEffect(() => {
        const fetchUtcTime = async () => {
            try {
                const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC')
                const data = await res.json()
                const utcTimestamp = new Date(data.dateTime).getTime()
                const localTimestamp = Date.now()

                setOffsetMs(localTimestamp - utcTimestamp)
            } catch {
                setOffsetMs(0)
            }
        }

        fetchUtcTime()
    }, [])

    return offsetMs
}
