"use client"

import Image from "next/image"
import { Track, usePlayer } from "@/components/player-context"

interface SongCardProps {
    track: Track
}

export default function SongCard({ track }: SongCardProps) {
    const { playTrack } = usePlayer()

    return (
        <div
            className="w-[170px] h-[253px] flex flex-col cursor-pointer group"
            onClick={() => playTrack(track)}
        >
            <div className="relative w-[170px] h-[170px] overflow-hidden rounded-lg bg-zinc-800">
                <Image
                    src={track.coverArt || "/songplaceholder.svg"}
                    alt={track.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <div className="mt-2">
                <p className="text-sm font-medium text-zinc-200 truncate">
                    {track.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
            </div>
        </div>
    )
}
