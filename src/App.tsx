import { useEffect, useState } from 'react'
import playlistData from './assets/playlist_data.json'
import type { Section } from './types'
import { SectionContainer } from './Section'

export const App = () => {
    const [sections, setSections] = useState<Section[]>([])

    useEffect(() => {
        setSections(playlistData.sections)
    }, [])

    if(sections.length === 0) {
        return <div>Loading...</div>
    }

    return (
        <>
            {
                sections.map((section, index) => (
                    <SectionContainer key={index} section={section} />
                ))
            }
        </>
    )
}