import Image from "next/image"
import Link from "next/link"
import { Album } from "@/lib/navidrome"
import { useNavidrome } from "@/components/navidrome-context"

interface AlbumCardProps {
    album: Album
}

export default function AlbumCard({ album }: AlbumCardProps) {
    const { api } = useNavidrome()

    const coverUrl = album.coverArt
        ? api?.getCoverArtUrl(album.coverArt, 300)
        : "/albumplaceholder.svg"

    return (
        <Link
            href={`/album/${album.id}`}
            className="w-[170px] h-[253px] flex flex-col cursor-pointer group"
        >
            <div className="relative w-[170px] h-[170px] overflow-hidden rounded-lg bg-zinc-800">
                <Image
                    src={coverUrl || "/albumplaceholder.svg"}
                    alt={`Cover art for ${album.name || "Unknown Album"}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <div className="mt-2">
                <p className="text-sm font-medium text-zinc-200 truncate">
                    {album.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                    {album.artist || "Unknown Artist"}
                </p>
            </div>
        </Link>
    )
}
