"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Artist } from "@/lib/navidrome"
import { useNavidrome } from "@/components/navidrome-context"
import { useInView } from "@/lib/hooks"

interface ArtistCardProps {
    artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    const { api } = useNavidrome()
    const [listenCount, setListenCount] = useState<number | null>(null)
    const [cardRef, isVisible] = useInView<HTMLAnchorElement>()

    const coverUrl = artist.coverArt
        ? api?.getCoverArtUrl(artist.coverArt, 300)
        : "/albumplaceholder.svg"

    // only fetch listen count when the card scrolls into view
    useEffect(() => {
        if (!api || !isVisible) return

        let cancelled = false

        const fetchListenCount = async () => {
            try {
                const result = await api.search(artist.name, 0, 0, 500)
                const totalPlays = result.songs
                    .filter(s => s.artist.toLowerCase() === artist.name.toLowerCase())
                    .reduce((sum, s) => sum + (s.playCount || 0), 0)
                if (!cancelled) setListenCount(totalPlays)
            } catch (err) {
                console.error("Failed to fetch listen count:", err)
                if (!cancelled) setListenCount(0)
            }
        }

        fetchListenCount()
        return () => { cancelled = true }
    }, [api, artist.name, isVisible])
    
    return (
        <Link
            ref={cardRef}
            href={`/artist/${artist.id}`}
            className="w-[140px] sm:w-[170px] flex flex-col items-center cursor-pointer group"
        >
            <div className="relative w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] overflow-hidden rounded-full bg-zinc-800">
                <Image
                    src={coverUrl || "/artistplaceholder.svg"}
                    alt={`Artist ${artist.name || "Unknown Artist"}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <div className="mt-3 text-center">
                <p className="text-sm font-medium text-zinc-200 truncate w-full mb-0.5">
                    {artist.name}
                </p>
                <p className="text-xs text-zinc-400 text-center truncate w-full">
                    {listenCount === null
                        ? `${artist.albumCount} album${artist.albumCount !== 1 ? "s" : ""}`
                        : `${listenCount.toLocaleString()} listen${listenCount !== 1 ? "s" : ""}`
                    }
                </p>
            </div>
        </Link>
    )
}
