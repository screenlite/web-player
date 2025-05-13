import { useEffect, useRef } from 'react'
import type { MediaSequenceState, Section } from '../types'
import { useSectionMediaItems } from './useSectionMediaItems'
import { calculateMediaSequenceState } from '../utils/calculateCurrentMediaState'
import { updateMediaItemsState } from '../utils/updateMediaItemsState'

const UPDATE_INTERVAL_MS = 50

export const useMediaSequence = (section: Section, playbackStartTime: number) => {
    const { mediaItems, setMediaItems, totalDurationRef } = useSectionMediaItems(section.items)
    const state = useRef<MediaSequenceState>(calculateMediaSequenceState(mediaItems, playbackStartTime, totalDurationRef.current))
	
    useEffect(() => {
        const intervalId = setInterval(() => {
            const newState = calculateMediaSequenceState(mediaItems, playbackStartTime, totalDurationRef.current)

            const stateChanged = newState.currentIndex !== state.current.currentIndex
							  || newState.shouldPreloadNext !== state.current.shouldPreloadNext
							  || newState.nextItemIndex !== state.current.nextItemIndex

            if (stateChanged) {
                state.current = newState
                const updatedItems = updateMediaItemsState(mediaItems, state.current)

                if (updatedItems !== mediaItems && state.current) {
                    setMediaItems(updatedItems)
                }
            }
        }, UPDATE_INTERVAL_MS)

        return () => clearInterval(intervalId)
    }, [mediaItems, playbackStartTime, setMediaItems, totalDurationRef])

    return { mediaItems }
}