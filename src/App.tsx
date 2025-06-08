import { useEffect, useMemo } from 'react'
import { useCMSAdapter } from './hooks/useCMSAdapter'
import { getCMSAdapter } from './utils/getCMSAdapter'
import { Player } from './Player'
import { useCachedData } from './hooks/useCachedData'
import { useConfigStore } from './stores/configStore'
import { ConfigOverlay } from './components/ConfigOverlay'

export const App = () => {
    const { config, loadConfig } = useConfigStore()
    const adapterParam = config.cmsAdapter
    const adapterUrl = config.cmsAdapterUrl
    const timezone = config.timezone

    useEffect(() => {
        loadConfig()
    }, [loadConfig])

    const adapter = useMemo(() => getCMSAdapter(adapterParam, adapterUrl), [adapterParam, adapterUrl])
    
    const data = useCMSAdapter({ adapter })

    const { cachedData, isCaching } = useCachedData(data)

    return (
        <>
            <ConfigOverlay />
            {cachedData.length > 0 ? (
                <Player data={data} timezone={timezone} />
            ) : !isCaching ? (
                <div className='bg-black w-screen h-screen overflow-hidden'>
                    <h1 className='text-white text-3xl font-bold'>Schedule is empty</h1>
                </div>
            ) : (
                <div className='bg-black w-screen h-screen overflow-hidden'>
                    <h1 className='text-white text-3xl font-bold'>Loading...</h1>
                </div>
            )}
        </>
    )
}