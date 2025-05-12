import type { Section } from './types'
import { useMediaSequence } from './hooks/useMediaSequence'
import { MediaRenderer } from './MediaRenderer'

export const SectionContainer = ({ section, scale, startTimestamp }: { section: Section, scale: number, startTimestamp: number }) => {	
    const onPlaybackComplete = (itemId: string) => {
        console.log(`Item ${itemId} completed playback`)
    }
	
    const { mediaItems } = useMediaSequence(section, startTimestamp, onPlaybackComplete)
	
    return (
        <MediaRenderer section={section} mediaItems={mediaItems} scale={ scale }/>
    )
}
