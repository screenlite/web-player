import { useEffect, useRef } from 'react'
import type { MediaSequenceState, Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'
import { hasStateChanged } from '../utils/hasStateChanged'

const UPDATE_INTERVAL_MS = 50

export const useMediaSequence = (section: Section, playbackStartTime: number) => {
    const {
        mediaItems,
        setMediaItems,
        totalDurationRef
    } = useSectionMediaItems(section.items)

    const stateRef = useRef<MediaSequenceState>(
        calculateMediaSequenceState(mediaItems, playbackStartTime, totalDurationRef.current)
    )

    const updateSequenceState = () => {
        const newState = calculateMediaSequenceState(
            mediaItems,
            playbackStartTime,
            totalDurationRef.current
        )

        if (hasStateChanged(stateRef.current, newState)) {
            stateRef.current = newState
            const updatedItems = updateMediaItemsState(mediaItems, newState)

            if (updatedItems !== mediaItems) {
                setMediaItems(updatedItems)
            }
        }
    }

    useEffect(() => {
        const intervalId = setInterval(updateSequenceState, UPDATE_INTERVAL_MS)

        return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaItems, playbackStartTime, setMediaItems, totalDurationRef])

    return { mediaItems }
}
