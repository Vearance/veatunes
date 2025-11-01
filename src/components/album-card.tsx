import Image from "next/image"

interface AlbumCardProps {
    album: {
        id: string
        title: string
        artist?: string
        coverUrl?: string
    }
}

export default function AlbumCard({ album }: AlbumCardProps) {
    return (
        <div className="w-[170px] h-[253px] flex flex-col cursor-pointer group">
            <div className="relative w-[170px] h-[170px] overflow-hidden rounded-lg bg-zinc-800">
                <Image
                    src={album.coverUrl || "/albumplaceholder.svg"}
                    alt={album.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <div className="mt-2">
                <p className="text-sm font-medium text-zinc-200 truncate">
                    {album.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                    {album.artist || "Unknown Artist"}
                </p>
            </div>
        </div>
    )
}
