import { useMemo } from 'react'
import type { MediaItem, Section } from './types'
import { MediaItemRenderer } from './MediaItemRenderer'

export const MediaRenderer = ({
    section,
    mediaItems,
    scale
}: {
    section: Section,
    mediaItems: MediaItem[],
    scale: number
}) => {
    const baseStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: Math.floor(section.position.x * scale),
        top: Math.floor(section.position.y * scale),
        width: Math.floor(section.position.width * scale),
        height: Math.floor(section.position.height * scale),
        zIndex: section.position.z_index,
    }), [section.position, scale])

    const imageStyle = useMemo(() => ({
        ...baseStyle,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }), [baseStyle])

    const videoStyle = useMemo(() => ({
        ...baseStyle,
        objectFit: 'cover' as const,
    }), [baseStyle])

    return (
        <>
            {mediaItems.map(item => (
                <MediaItemRenderer
                    key={item.id}
                    item={item}
                    imageStyle={imageStyle}
                    videoStyle={videoStyle}
                />
            ))}
        </>
    )
}
