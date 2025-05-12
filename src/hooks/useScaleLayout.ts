import { useMemo, useState, useEffect } from 'react'
import type { Playlist } from '../types'

export const useScaleLayout = (playlist: Playlist, scaleLayout: boolean) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const scale = useMemo(() => {
        if (!scaleLayout) {
            return 1
        }
        const containerWidth = windowSize.width
        const containerHeight = windowSize.height
        const playlistWidth = playlist.width
        const playlistHeight = playlist.height
        const scaleX = containerWidth / playlistWidth
        const scaleY = containerHeight / playlistHeight

        return Math.min(scaleX, scaleY)
    }, [playlist, scaleLayout, windowSize])

    return scale
}