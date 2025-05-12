import type { Section } from './types'
import { useMediaSequence } from './hooks/useMediaSequence'
import { MediaRenderer } from './MediaRenderer'

export const SectionContainer = ({ section, scale, playbackStartedAt }: { section: Section, scale: number, playbackStartedAt: number }) => {	
    const { mediaItems } = useMediaSequence(section, playbackStartedAt)
	
    return (
        <MediaRenderer section={section} mediaItems={mediaItems} scale={ scale }/>
    )
}
