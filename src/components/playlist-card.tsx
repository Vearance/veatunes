"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Playlist } from "@/lib/navidrome"
import { useNavidrome } from "@/components/navidrome-context"

interface PlaylistCardProps {
    playlist: Playlist
}

// TODO: apply colorExtraction

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
    const { api } = useNavidrome()
    const [titles, setTitles] = useState<string[] | null>(null);

    const coverUrl = playlist.coverArt
        ? api?.getCoverArtUrl(playlist.coverArt, 300)
        : "/songplaceholder.svg"

    useEffect(() => {
        if (!api) return;
        api.getPlaylist(playlist.id)
            .then(res => {
                const songTitles = res.songs.map(s => s.title);
                setTitles(songTitles.slice(0, 3));
            })
            .catch(err => {
                console.error("Failed to load playlist songs", err);
                setTitles(null);
            });
    }, [api, playlist.id]);

    const previewTitles = titles ? titles.join(", ") : null;

    return (
        <Link href={`/playlist/${playlist.id}`} className="w-[170px] h-[253px] flex flex-col cursor-pointer group">
            <div className="relative flex flex-col items-center">

                <div className="bg-[#73737326] w-[133px] h-[3px] rounded-t-[7.25px]" />

                <div className="h-[1px]" />

                <div className="bg-[#7373734D] w-[154px] h-[6px] rounded-t-[7.25px]" />

                <div className="h-[1px]" />

                <div className="relative w-[170px] h-[170px] rounded-lg overflow-hidden bg-zinc-800">
                    <Image
                        src={coverUrl || "/songplaceholder.svg"}
                        alt={`Cover art for ${playlist.name || "Unknown Playlist"}`}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-primary truncate">
                    {playlist.name}
                </p>
                <p className="text-sm text-zinc-400 flex-shrink-0 ml-2">
                    {playlist.songCount}
                </p>
            </div>

            <p className="text-xs text-secondary line-clamp-2">
                {previewTitles ? `${previewTitles}${playlist.songCount > 3 ? ", and more" : ""}` : "No songs"}
            </p>

        </Link>
    );
}
