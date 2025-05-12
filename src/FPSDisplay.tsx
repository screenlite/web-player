import { useEffect, useRef, useState } from 'react'

export const FPSDisplay = () => {
    const [fps, setFps] = useState<number>(0)
    const frames = useRef<number>(0)
    const lastTime = useRef<number>(performance.now())

    useEffect(() => {
        let animationFrameId: number

        const loop = (time: number) => {
            frames.current += 1

            if (time - lastTime.current >= 1000) {
                setFps(frames.current)
                frames.current = 0
                lastTime.current = time
            }

            animationFrameId = requestAnimationFrame(loop)
        }

        animationFrameId = requestAnimationFrame(loop)

        return () => cancelAnimationFrame(animationFrameId)
    }, [])

    return (
        <div className="fixed top-2 left-2 bg-black text-green-400 text-sm font-mono px-2 py-1 rounded shadow-md z-50">
      		FPS: {fps}
        </div>
    )
}