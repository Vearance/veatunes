"use client"

import { useNavidrome } from "@/components/navidrome-context"
import PlaylistCard from "@/components/playlist-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PlaylistPage() {
    const { playlists, playlistsLoading } = useNavidrome()

    if (playlistsLoading) {
        return (
            <div className="p-4 space-y-6">
                <h1 className="text-2xl font-semibold text-zinc-100">Playlists</h1>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-[170px] h-[253px] flex flex-col space-y-2 animate-pulse">
                            <Skeleton className="w-[170px] h-[170px] rounded-lg bg-zinc-800" />
                            <Skeleton className="h-2 w-3/4 bg-zinc-700" />
                            <Skeleton className="h-1.5 w-1/2 bg-zinc-700" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-semibold text-zinc-100">Playlists</h1>
            {playlists.length === 0 ? (
                <p className="text-zinc-400">No playlists yet.</p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-6">
                    {playlists.map(pl => (
                        <PlaylistCard key={pl.id} playlist={pl} />
                    ))}
                </div>
            )}
        </div>
    )
}
