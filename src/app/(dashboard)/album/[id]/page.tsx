"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useNavidrome } from "@/components/navidrome-context"
import { Album, Song } from "@/lib/navidrome"
import { formatDuration } from "@/lib/song-utils"

export default function AlbumDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { api, isConnected } = useNavidrome()
    const [album, setAlbum] = useState<Album | null>(null)
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!api || !isConnected || !id) return

        const fetchAlbum = async () => {
            try {
                const { album: albumInfo, songs: albumSongs } = await api.getAlbum(id)
                setAlbum(albumInfo)
                setSongs(albumSongs)
            } catch (error) {
                console.error("Failed to fetch album:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAlbum()
    }, [api, isConnected, id])

    if (loading) return <p className="text-zinc-400 p-4">Loading album...</p>
    if (!album) return <p className="text-zinc-400 p-4">Album not found.</p>

    const coverUrl = album.coverArt
        ? api?.getCoverArtUrl(album.coverArt, 300)
        : "/albumplaceholder.svg"

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-start gap-6">
                <div className="relative w-[170px] h-[170px] rounded-lg overflow-hidden bg-zinc-800">
                    <Image
                        src={coverUrl || "/albumplaceholder.svg"}
                        alt={`Cover art for ${album.name || "Unknown Album"}`}
                        fill
                        className="object-cover transition-transform duration-200 hover:scale-105"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-100">{album.name}</h1>
                    <p className="text-zinc-400">{album.artist || "Unknown Artist"}</p>
                    <p className="text-sm text-zinc-500 mt-1">{album.songCount} songs</p>
                </div>
            </div>

            <div className="space-y-2">
                {songs.map((song) => (
                    <div
                        key={song.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <span className="text-zinc-200 truncate">
                            {song.title}
                        </span>
                        <span className="text-zinc-400 text-sm">
                            {formatDuration(song.duration)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
