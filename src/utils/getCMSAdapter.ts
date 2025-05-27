import { NetworkFileAdapter } from '../adapters/NetworkFileAdapter'
import { GarlicHubAdapter } from '../adapters/GarlicHubAdapter'
import { ScreenliteAdapter } from '../adapters/ScreenliteAdapter'

export const getCMSAdapter = (adapter: string | null) => {
    const adapterEnv = adapter || import.meta.env.VITE_CMS_ADAPTER
    const url = import.meta.env.VITE_CMS_ADAPTER_URL || ''

    if (adapterEnv === 'NetworkFile') {
        return new NetworkFileAdapter(url)
    } else if (adapterEnv === 'GarlicHub') {
        return new GarlicHubAdapter(url)
    } else if (adapterEnv === 'Screenlite') {
        return new ScreenliteAdapter(url)	
    } else {
        throw new Error(`Unknown CMS adapter: ${adapterEnv}`)
    }
}
