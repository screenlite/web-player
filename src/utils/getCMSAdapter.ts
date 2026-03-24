import { NetworkFileAdapter } from '../adapters/NetworkFileAdapter'
import { GarlicHubAdapter } from '../adapters/GarlicHubAdapter'
import { ScreenliteAdapter } from '../adapters/ScreenliteAdapter'
import { ScreenlitePlaygroundAdapter } from '../adapters/ScreenlitePlaygroundAdapter'

export const getCMSAdapter = (adapter: string, url: string) => {
    if (adapter === 'NetworkFile') {
        return new NetworkFileAdapter(url)
    } else if (adapter === 'GarlicHub') {
        return new GarlicHubAdapter(url)
    } else if (adapter === 'Screenlite') {
        return new ScreenliteAdapter(url)
    } else if (adapter === 'ScreenlitePlayground') {
        return new ScreenlitePlaygroundAdapter(url)
    } else {
        throw new Error(`Unknown CMS adapter: ${adapter}`)
    }
}
