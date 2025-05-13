import { useEffect, useRef } from 'react'

export const useMediaItemPlaybackTracker = (id: string, hidden: boolean) => {
    const wasVisibleRef = useRef(false)
    const visibleTimestampRef = useRef<string | null>(null)

    useEffect(() => {
        if (!hidden) {
            if (!wasVisibleRef.current) {
                wasVisibleRef.current = true
                visibleTimestampRef.current = new Date().toISOString()
            }
        } else {
            if (wasVisibleRef.current) {
                const hiddenTimestamp = new Date().toISOString()

                console.log('========================================')
                console.log('Media Item Playback Tracker')
                console.log('----------------------------------------')
                console.log(`Media item ID: "${id}"`)
                console.log(`Visible from: ${visibleTimestampRef.current}`)
                console.log(`Hidden at: ${hiddenTimestamp}`)
                console.log('========================================')

                wasVisibleRef.current = false
                visibleTimestampRef.current = null
            }
        }
    }, [hidden, id])
}
