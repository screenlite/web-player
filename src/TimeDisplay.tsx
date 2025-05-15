import { useEffect, useState } from 'react'

export const TimeDisplay = ({ offsetMs }: { offsetMs: number }) => {
    const [now, setNow] = useState<number>(performance.now())

    useEffect(() => {
        let animationFrameId: number

        const loop = (time: number) => {
            setNow(time)
            animationFrameId = requestAnimationFrame(loop)
        }

        animationFrameId = requestAnimationFrame(loop)

        return () => cancelAnimationFrame(animationFrameId)
    }, [])

    return (
        <div className="fixed top-2 right-2 bg-black text-green-400 text-sm font-mono px-2 py-1 rounded shadow-md z-50">
			Time - offset: {(now - offsetMs).toFixed(0)} ms
        </div>
    )
}
