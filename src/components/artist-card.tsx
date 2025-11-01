import Image from "next/image"
import { Artist } from "@/lib/navidrome"
import { useNavidrome } from "@/components/navidrome-context"

interface ArtistCardProps {
    artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    const { api } = useNavidrome()

    const coverUrl = artist.coverArt
        ? api?.getCoverArtUrl(artist.coverArt, 300)
        : "/albumplaceholder.svg"

    // placeholder
    const listenCount = 1  // TODO: implement listen count
    
    return (
        <div className="w-[170px] h-[253px] flex flex-col items-center cursor-pointer group">
            <div className="relative w-[170px] h-[170px] overflow-hidden rounded-full bg-zinc-800">
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
                {listenCount !== undefined && (
                    <p className="text-xs text-zinc-400 text-center truncate w-full">
                        {listenCount.toLocaleString()} listens
                    </p>
                )}
            </div>
        </div>
    )
}
