"use client"

import { Button } from "@heroui/react"
import { useSWRConfig } from "swr"


export function ClearCacheButton({ cacheName }: { cacheName: string }) {
    const { mutate } = useSWRConfig()

    const handleClick = () => {
        mutate(
            cacheName, // which cache keys are updated
            undefined, // update cache data to `undefined`
            { revalidate: false } // do not revalidate
        )
    }

    return (
        <Button
            className="rounded mt-20"
            variant="solid"
            onPress={handleClick}
        >
            Clear Cache
        </Button>
    )
}