import type { Section } from './types'
import { useMediaSequence } from './hooks/useMediaSequence'
import { MediaRenderer } from './MediaRenderer'
import { useMemo } from 'react'

export const SectionContainer = ({ section, scale, elapsedSinceStart }: { section: Section, scale: number, elapsedSinceStart: number }) => {	
    const { mediaItems } = useMediaSequence(section, elapsedSinceStart)
	
    const style = useMemo(() => ({
        position: 'fixed' as const,
        left: Math.floor(section.position.x * scale),
        top: Math.floor(section.position.y * scale),
        width: Math.floor(section.position.width * scale),
        height: Math.floor(section.position.height * scale),
        overflow: 'hidden' as const,
        zIndex: section.position.z_index,
    }), [section.position, scale])

    return (
        <div style={ style }>
            <MediaRenderer mediaItems={mediaItems}/>
        </div>
    )
}
