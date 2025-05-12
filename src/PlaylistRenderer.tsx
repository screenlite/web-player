import { useEffect, useMemo, useState } from 'react'
import type { Playlist, Section } from './types'
import { useScaleLayout } from './hooks/useScaleLayout'
import { SectionContainer } from './SectionContainer'

export const PlaylistRenderer = ({ playlist, startTimestamp }: { playlist: Playlist, startTimestamp: number }) => {
    const config = useMemo(() => {
        return {
            scaleLayout: true,
        }
    }, [])
		
    const [sections, setSections] = useState<Section[]>([])

    useEffect(() => {
        setSections(playlist.sections)
    }, [playlist])

    const scale = useScaleLayout(playlist, config.scaleLayout)

    return (
        <div className='bg-black w-screen h-screen overflow-hidden'>
            {
                sections.map((section, index) => (
                    <SectionContainer key={index} section={section} scale={scale} startTimestamp={ startTimestamp }/>
                ))
            }
        </div>
    )
}
