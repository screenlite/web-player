import { useEffect, useRef } from 'react'
import type { MediaSequenceState, Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'
import { hasStateChanged } from '../utils/hasStateChanged'

export const useMediaSequence = (section: Section, elapsedSinceStart: number) => {
    const { mediaItems, setMediaItems, totalDurationRef } = useSectionMediaItems(section.items)
    const stateRef = useRef<MediaSequenceState | null>(null)

    useEffect(() => {
        const totalDuration = totalDurationRef.current
        const newState = calculateMediaSequenceState(mediaItems, elapsedSinceStart, totalDuration)

        if (stateRef.current && !hasStateChanged(stateRef.current, newState)) return

        stateRef.current = newState
        const updatedItems = updateMediaItemsState(mediaItems, newState)

        if (updatedItems !== mediaItems) {
            setMediaItems(updatedItems)
        }
    }, [mediaItems, elapsedSinceStart, setMediaItems, totalDurationRef])

    return { mediaItems }
}
