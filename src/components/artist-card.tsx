import Image from "next/image"

interface ArtistCardProps {
    artist: {
        id: string
        name: string
        coverUrl?: string
        listenCount?: number
    }
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    return (
        <div className="w-[170px] h-[253px] flex flex-col items-center cursor-pointer group">
            <div className="relative w-[170px] h-[170px] overflow-hidden rounded-full bg-zinc-800">
                <Image
                    src={artist.coverUrl || "/artistplaceholder.svg"}
                    alt={artist.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
            </div>
            <div className="mt-3 text-center">
                <p className="text-sm font-medium text-zinc-200 truncate w-full mb-0.5">
                    {artist.name}
                </p>
                {artist.listenCount !== undefined && (
                    <p className="text-xs text-zinc-400 text-center truncate w-full">
                        {artist.listenCount.toLocaleString()} listens
                    </p>
                )}
            </div>
        </div>
    )
}
