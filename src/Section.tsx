import { useRef, Fragment, useMemo } from 'react'
import type { Section } from './types'
import { useMediaPlayback } from './hooks/useMediaPlayback'
import { useMediaSequence } from './hooks/useMediaSequence'

export const SectionContainer = ({ section }: { section: Section }) => {
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

    const { mediaItems } = useMediaSequence(section, 1747054972)

    useMediaPlayback(mediaItems, videoRefs)

    const baseStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: section.position.x,
        top: section.position.y,
        width: section.position.width,
        height: section.position.height,
        zIndex: section.position.z_index,
    }), [section.position])

    const imageStyle = useMemo(() => ({
        ...baseStyle,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }), [baseStyle])

    const videoStyle = useMemo(() => ({
        ...baseStyle,
        objectFit: 'cover' as const,
    }), [baseStyle])

    const overlayStyle = useMemo(() => ({
        position: 'absolute' as const,
        left: section.position.x,
        top: section.position.y + 50,
        zIndex: section.position.z_index + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
    }), [section.position])

    const overlayTextStyle = useMemo(() => ({
        color: 'white',
        fontSize: '2em',
        textAlign: 'center' as const,
    }), [])

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

                    <div
                        style={{
                            ...overlayStyle,
                            display: item.hidden ? 'none' : 'block',
                        }}
                    >
                        <span style={overlayTextStyle}>{item.id}</span>
                    </div>
                </Fragment>
            ))}
        </>
    )
}
