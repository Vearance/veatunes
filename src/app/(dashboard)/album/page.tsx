"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useNavidrome } from "@/components/navidrome-context";
import { Album } from "@/lib/navidrome";

export default function AlbumPage() {
    const { api, isConnected } = useNavidrome();
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConnected || !api) return;

        const fetchAlbums = async () => {
            try {
                const res = await api.getAlbums("newest");
                setAlbums(res);
            } catch (error) {
                console.error("Failed to fetch albums:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, [api, isConnected]);

    if (loading) return <p className="text-zinc-400 p-4">Loading albums...</p>;
    if (!albums.length) return <p className="text-zinc-400 p-4">No albums found.</p>;

    return (
        <div className="p-3 md:p-6">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1">
                {albums.map((album) => {
                    const coverUrl = album.coverArt
                        ? api?.getCoverArtUrl(album.coverArt, 300)
                        : "/albumplaceholder.svg";

                    return (
                        <Link
                            key={album.id}
                            href={`/album/${album.id}`}
                            className="group flex flex-col items-center text-center rounded-lg overflow-hidden p-1">
                            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-zinc-800">
                                <Image
                                    src={coverUrl || "/albumplaceholder.svg"}
                                    alt={`Cover art for ${ album.name || "Unknown Album"}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end items-center p-4">
                                    <p className="text-sm font-medium text-zinc-100 truncate w-full text-center">
                                        {album.name}
                                    </p>
                                    <p className="text-xs text-zinc-400 truncate w-full text-center">
                                        {album.artist || "Unknown Artist"}
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
