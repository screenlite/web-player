import type { Section } from './types'
import { useMediaSequence } from './hooks/useMediaSequence'
import { MediaRenderer } from './MediaRenderer'

export const SectionContainer = ({ section, scale, elapsedSinceStart }: { section: Section, scale: number, elapsedSinceStart: number }) => {	
    const { mediaItems } = useMediaSequence(section, elapsedSinceStart)
	
    return (
        <MediaRenderer section={section} mediaItems={mediaItems} scale={ scale }/>
    )
}
