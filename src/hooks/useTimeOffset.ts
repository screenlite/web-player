import { useState } from 'react'

export const useTimeOffset = () => {
    const [offsetMs] = useState<number>(0)

    return offsetMs
}