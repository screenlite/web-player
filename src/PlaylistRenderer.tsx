import type { Playlist } from './types'
import { useScaleLayout } from './hooks/useScaleLayout'
import { SectionContainer } from './SectionContainer'
import { ElapsedDisplay } from './ElapsedDisplay'

export const PlaylistRenderer = ({ playlist, elapsedSinceStart }: { playlist: Playlist, elapsedSinceStart: number }) => {
    const sections = playlist.sections

    const config = { scaleLayout: true }

    const scale = useScaleLayout(playlist, config.scaleLayout)

    return (
        <>
            <ElapsedDisplay elapsed={(elapsedSinceStart / 1000)} />
            <div className='bg-black w-screen h-screen overflow-hidden'>
                {
                    sections.map((section, index) => (
                        <SectionContainer key={index} section={section} scale={scale} elapsedSinceStart={ elapsedSinceStart }/>
                    ))
                }
            </div>
        </>
    )
}
