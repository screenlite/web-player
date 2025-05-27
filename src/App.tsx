import { useMemo } from 'react'
import { useCMSAdapter } from './hooks/useCMSAdapter'
import { getCMSAdapter } from './utils/getCMSAdapter'
import { Player } from './Player'
import { useCachedData } from './hooks/useCachedData'

export const App = () => {
    const searchParams = new URLSearchParams(window.location.search)
    
    const adapterParam = searchParams.get('adapter')

    const adapter = useMemo(() => getCMSAdapter(adapterParam), [adapterParam])
    
    const data = useCMSAdapter({ adapter })

    const timezone = import.meta.env.VITE_TIMEZONE

    const { cachedData, isCaching } = useCachedData(data)

    if(cachedData.length > 0) return <Player data={ data } timezone={timezone} />

    if (!isCaching) {
        return (
            <div className='bg-black w-screen h-screen overflow-hidden'>
                <h1 className='text-white text-3xl font-bold'>Schedule is empty</h1>
            </div>
        )
    }

    if (isCaching) {
        return (
            <div className='bg-black w-screen h-screen overflow-hidden'>
                <h1 className='text-white text-3xl font-bold'>Loading...</h1>
            </div>
        )
    }
}