import Image from "next/image"

interface SongCardProps {
    song: {
        id: string
        title: string
        artist: string
        coverUrl?: string
    }
}

export default function SongCard({ song }: SongCardProps) {
    return (
        <div className="w-[170px] h-[253px] flex flex-col cursor-pointer group">
            <div className="relative w-[170px] h-[170px] overflow-hidden rounded-lg bg-zinc-800">
                <Image
                    src={song.coverUrl || "/songplaceholder.svg"}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <div className="mt-2">
                <p className="text-sm font-medium text-zinc-200 truncate">
                    {song.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
            </div>
        </div>
    )
}
