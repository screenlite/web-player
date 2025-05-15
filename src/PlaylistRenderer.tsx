import type { Playlist } from './types'
import { useScaleLayout } from './hooks/useScaleLayout'
import { SectionContainer } from './SectionContainer'

export const PlaylistRenderer = ({ playlist, startTimestamp }: { playlist: Playlist, startTimestamp: number }) => {
    const sections = playlist.sections

    const config = { scaleLayout: true }

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
