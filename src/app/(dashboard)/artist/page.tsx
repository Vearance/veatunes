"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useNavidrome } from "@/components/navidrome-context";
import { Artist } from "@/lib/navidrome";

export default function ArtistPage() {
    const { api, isConnected } = useNavidrome();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConnected || !api) return;

        const fetchArtists = async () => {
            try {
                const res = await api.getArtists();
                setArtists(res);
            } catch (error) {
                console.error("Failed to fetch artists:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, [api, isConnected]);

    if (loading) return <p className="text-zinc-400 p-4">Loading artists...</p>;
    if (!artists.length)
        return <p className="text-zinc-400 p-4">No artists found.</p>;

    return (
        <div className="p-3 md:p-6">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1">
                {artists.map((artist) => {
                    const coverUrl = artist.coverArt
                        ? api?.getCoverArtUrl(artist.coverArt, 300)
                        : "/artistplaceholder.svg";

                    return (
                        <Link
                            key={artist.id}
                            href={`/artist/${artist.id}`}
                            className="group flex flex-col items-center text-center rounded-lg overflow-hidden p-1">
                            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-800">
                                <Image
                                    src={coverUrl || "/artistplaceholder.svg"}
                                    alt={`Cover art for ${ artist.name || "Unknown Artist"}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end items-center p-4">
                                    <p className="text-sm font-medium text-zinc-100 truncate w-full text-center">
                                        {artist.name}
                                    </p>
                                    <p className="text-xs text-zinc-400 truncate w-full text-center">
                                        {artist.albumCount || 0} albums
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
