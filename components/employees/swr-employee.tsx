"use client"

import useSWR from "swr"
import { ClearCacheButton } from "./ClearCacheButton"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface User {
    id: string;
}

export function User2(props:User) {
    
    const {id} = props
    const { data: user, isLoading } = useSWR(`/api/employees/${id}`, fetcher);

    if (isLoading) return <p>isLoading is true!</p>

    if (!user) return <p>Failed to load user.</p>

    return (
        <>
            <h1 className="text-5xl text-white">{user.firstName}</h1>
            <ClearCacheButton cacheName={`/api/employees/${id}`} />
        </>
    )
}