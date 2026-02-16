"use client"

import { useState, useEffect } from "react"
import { useNavidrome } from "@/components/navidrome-context"
import { usePlayer } from "@/components/player-context"
import { Song } from "@/lib/navidrome"
import SongCard from "@/components/song-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MoodsPage() {
    const { api, musicFolders, isConnected } = useNavidrome()
    const { songToTrack } = usePlayer()

    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const [moodsFolderId, setMoodsFolderId] = useState<number | null>(null)

    // find the moods folder once music folders are loaded
    useEffect(() => {
        if (musicFolders.length === 0) return
        const moods = musicFolders.find(f => f.name.toLowerCase().includes("moods"))
        if (moods) {
            setMoodsFolderId(moods.id)
        } else {
            setLoading(false)
        }
    }, [musicFolders])

    // load all songs from the moods library
    useEffect(() => {
        if (!api || !isConnected || moodsFolderId === null) return

        const loadMoodsSongs = async () => {
            setLoading(true)
            try {
                const moodsSongs = await api.getAllSongs(500, 0, moodsFolderId)
                setSongs(moodsSongs)
            } catch (err) {
                console.error("Failed to load moods songs:", err)
            } finally {
                setLoading(false)
            }
        }

        loadMoodsSongs()
    }, [api, isConnected, moodsFolderId])

    // no moods folder found
    if (!loading && moodsFolderId === null) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <p className="text-zinc-400 text-sm">
                    No Moods library found. Set up a &quot;Moods&quot; library in your Navidrome server to see content here.
                </p>
                <p className="text-zinc-600 text-xs mt-2">
                    Go to Navidrome → Settings → Libraries → Create a library named &quot;Moods&quot;
                </p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 md:gap-6">
                {loading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-[140px] sm:w-[170px] flex flex-col space-y-2 animate-pulse">
                            <Skeleton className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-lg bg-zinc-800" />
                            <Skeleton className="h-2 w-3/4 bg-zinc-700" />
                            <Skeleton className="h-1.5 w-1/2 bg-zinc-700" />
                        </div>
                    ))
                ) : songs.length === 0 ? (
                    <p className="text-zinc-400 col-span-full">No songs found in Moods library.</p>
                ) : (
                    songs.map(song => (
                        <SongCard key={song.id} track={songToTrack(song)} />
                    ))
                )}
            </div>
        </div>
    )
}
