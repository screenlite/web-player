import { NetworkFileAdapter } from '../adapters/NetworkFileAdapter'
import { GarlicHubAdapter } from '../adapters/GarlicHubAdapter'
import { ScreenliteAdapter } from '../adapters/ScreenliteAdapter'

export const getCMSAdapter = (adapter: string, url: string) => {
    if (adapter === 'NetworkFile') {
        return new NetworkFileAdapter(url)
    } else if (adapter === 'GarlicHub') {
        return new GarlicHubAdapter(url)
    } else if (adapter === 'Screenlite') {
        return new ScreenliteAdapter(url)	
    } else {
        throw new Error(`Unknown CMS adapter: ${adapter}`)
    }
}
