import { useEffect } from 'react'
import type { Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'

const UPDATE_INTERVAL_MS = 50

export const useMediaSequence = (section: Section, playbackStartTime: number) => {
    const { mediaItems, setMediaItems, totalDurationRef } = useSectionMediaItems(section.items)

    useEffect(() => {
        if (mediaItems.length === 0 || !playbackStartTime) return

        const intervalId = setInterval(() => {
            const currentState = calculateMediaSequenceState(mediaItems, playbackStartTime, totalDurationRef.current)

            setMediaItems((prevItems) => {
                return updateMediaItemsState(prevItems, currentState)
            })
        }, UPDATE_INTERVAL_MS)

        return () => clearInterval(intervalId)
    }, [mediaItems, playbackStartTime, setMediaItems, totalDurationRef])

    return { mediaItems }
}