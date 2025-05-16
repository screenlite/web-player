import { useEffect, useRef, useState } from 'react'
// import { useTimeServer } from './useTimeServer'

export const useCurrentTimestamp = () => {
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now())
    const lastSecondRef = useRef<number>(new Date(currentTimestamp).getSeconds())
	
    const serverTime = null // useTimeServer()
	
    useEffect(() => {
        const interval = setInterval(() => {
            const now = serverTime || Date.now()
            const date = new Date(now)
            const currentSecond = date.getSeconds()
	
            if (currentSecond !== lastSecondRef.current) {
                setCurrentTimestamp(now)
                lastSecondRef.current = currentSecond
            }
        }, 10)
	
        return () => clearInterval(interval)
    }, [serverTime])

    return currentTimestamp
}