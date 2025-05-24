import { useEffect, useState, useRef } from 'react'
import type { CMSAdapter } from '../types'

type UseCMSAdapterOptions = {
  adapter: CMSAdapter;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCMSAdapter<T = any>({ adapter }: UseCMSAdapterOptions): T | null {
    const [data, setData] = useState<T | null>(null)
    const adapterRef = useRef<CMSAdapter | null>(null)

    useEffect(() => {
        adapterRef.current = adapter

        adapterRef.current.onUpdate((newState: T) => {
            setData(newState)
        })

        adapterRef.current.connect()

        return () => {
            adapterRef.current?.disconnect()
        }
    }, [adapter])

    return data
}