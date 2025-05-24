import { useEffect, useRef, useState } from 'react'
// import { useTimeServer } from './useTimeServer'

export const useCurrentTimestamp = (timezone: string) => {
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now())
    const lastSecondRef = useRef<number>(new Date(currentTimestamp).getSeconds())

    const serverTime = null // useTimeServer()

    const getTimezoneOffset = (date: Date, tz: string): number => {
        try {
            const localeString = date.toLocaleString('en-US', { timeZone: tz })
            const localDate = new Date(localeString)

            return localDate.getTime() - date.getTime()
        } catch {
            return 0
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const now = serverTime || Date.now()
            const date = new Date(now)
            const currentSecond = date.getSeconds()

            if (currentSecond !== lastSecondRef.current) {
                const offset = getTimezoneOffset(date, timezone)

                setCurrentTimestamp(now + offset)
                lastSecondRef.current = currentSecond
            }
        }, 10)

        return () => clearInterval(interval)
    }, [serverTime, timezone])

    return currentTimestamp
}