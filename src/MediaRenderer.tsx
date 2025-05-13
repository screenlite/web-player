import { Fragment, useMemo, useRef } from 'react'
import type { MediaItem, Section } from './types'
import { useMediaPlayback } from './hooks/useMediaPlayback'

export const MediaRenderer = ({ section, mediaItems, scale}: { section: Section, mediaItems: MediaItem[], scale: number}) => {
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

    useMediaPlayback(mediaItems, videoRefs)

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
            {mediaItems.filter(item => item.preload || !item.hidden).map((item) => (
                <Fragment key={item.id}>
                    {item.type === 'image' ? (
                        <div
                            style={{
                                ...imageStyle,
                                backgroundImage: `url(${item.src})`,
                                opacity: item.hidden ? 0 : 1,
                            }}
                        />
                    ) : (
                        <video
                            ref={(el) => { videoRefs.current[item.id] = el }}
                            style={{
                                ...videoStyle,
                                opacity: item.hidden ? 0 : 1,
                            }}
                            loop
                            muted
                        >
                            <source src={item.src} type="video/mp4" />
                        </video>
                    )}
                </Fragment>
            ))}
        </>
    )
}
