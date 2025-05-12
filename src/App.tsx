import { useEffect, useMemo, useState } from 'react'
import playlistData from './assets/playlist_data.json'
import type { Section } from './types'
import { SectionContainer } from './SectionContainer'
import { useScaleLayout } from './hooks/useScaleLayout'

export const App = () => {
    const config = useMemo(() => {
        return {
            playbackStartedAt: 1747054972,
            scaleLayout: true,
        }
    }, [])
		
    const [sections, setSections] = useState<Section[]>([])

    useEffect(() => {
        setSections(playlistData.sections)
    }, [])

    const scale = useScaleLayout(playlistData, config.scaleLayout)

    if(sections.length === 0) {
        return <div>Loading...</div>
    }

    return (
        <div className='bg-black w-screen h-screen overflow-hidden'>
            {
                sections.map((section, index) => (
                    <SectionContainer key={index} section={section} scale={scale} playbackStartedAt={ config.playbackStartedAt }/>
                ))
            }
        </div>
    )
}