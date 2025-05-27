import { useEffect } from 'react'
import type { Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'

export const useMediaSequence = (section: Section, elapsedSinceStart: number) => {
    const { mediaItems, setMediaItems, totalDurationRef } = useSectionMediaItems(section.items, elapsedSinceStart)

    useEffect(() => {
        const totalDuration = totalDurationRef.current
        const newState = calculateMediaSequenceState(mediaItems, elapsedSinceStart, totalDuration)

        const updatedItems = updateMediaItemsState(mediaItems, newState)

        if (updatedItems !== mediaItems) {
            setMediaItems(updatedItems)
        }
    }, [mediaItems, elapsedSinceStart, setMediaItems, totalDurationRef])

    return { mediaItems }
}
