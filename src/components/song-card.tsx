import { useState } from "react"
import Image from "next/image"
import { Track, usePlayer } from "@/components/player-context"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AddToPlaylistDialog } from "@/components/add-to-playlist-dialog"
import { useNavidrome } from "@/components/navidrome-context"

interface SongCardProps {
    track: Track
}

export default function SongCard({ track }: SongCardProps) {
    const { playTrack, addToQueue } = usePlayer()
    const { starItem, unstarItem, refreshData } = useNavidrome()
    const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false)
    const [isStarred, setIsStarred] = useState(track.starred !== undefined)

    const handleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            if (isStarred) {
                await unstarItem(track.id, 'song')
                setIsStarred(false)
            } else {
                await starItem(track.id, 'song')
                setIsStarred(true)
            }
            refreshData()
        } catch (error) {
            console.error("Failed to toggle favorite:", error)
        }
    }

    return (
        <div
            className="w-[140px] sm:w-[170px] flex flex-col cursor-pointer group relative"
            onClick={() => playTrack(track)}
        >
            <div className="relative w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] overflow-hidden rounded-lg bg-zinc-800">
                <Image
                    src={track.coverArt || "/songplaceholder.svg"}
                    alt={track.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation()
                                    addToQueue(track)
                                }}
                            >
                                Add to Queue
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPlaylistDialogOpen(true)
                                }}
                            >
                                Add to Playlist
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleFavorite}>
                                {isStarred ? "Remove from Favorites" : "Add to Favorites"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="mt-2 text-left">
                <p className="text-sm font-medium text-zinc-200 truncate pr-6">
                    {track.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
            </div>

            <AddToPlaylistDialog 
                isOpen={playlistDialogOpen}
                onClose={() => setPlaylistDialogOpen(false)}
                songId={track.id}
                songTitle={track.name}
            />
        </div>
    )
}
