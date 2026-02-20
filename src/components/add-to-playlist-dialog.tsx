import { useState, useEffect } from "react"
import Image from "next/image"
import { useNavidrome } from "@/components/navidrome-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Playlist } from "@/lib/navidrome"
import { Loader2 } from "lucide-react"

interface AddToPlaylistDialogProps {
    isOpen: boolean
    onClose: () => void
    songId: string
    songTitle?: string
}

export function AddToPlaylistDialog({ isOpen, onClose, songId, songTitle }: AddToPlaylistDialogProps) {
    const { playlists, createPlaylist, addToPlaylist, isConnected } = useNavidrome()
    const [isCreating, setIsCreating] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsCreating(false)
            setNewPlaylistName("")
            setError(null)
            setIsSubmitting(false)
        }
    }, [isOpen])

    if (!isConnected) return null

    const handleAddToExisting = async (playlist: Playlist) => {
        setIsSubmitting(true)
        setError(null)
        try {
            await addToPlaylist(playlist.id, songId)
            onClose()
        } catch (err) {
            console.error("Failed to add to playlist:", err)
            setError("Cannot add to playlist right now.")
            setIsSubmitting(false)
        }
    }

    const handleCreateAndAdd = async () => {
        if (!newPlaylistName.trim()) return

        setIsSubmitting(true)
        setError(null)
        try {
            await createPlaylist(newPlaylistName.trim(), [songId])
            onClose()
        } catch (err) {
            console.error("Failed to create playlist:", err)
            setError("Failed to create playlist.")
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-foreground border-zinc-800 text-white rounded-2xl p-6 shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-zinc-100">Add to Playlist</DialogTitle>
                    <DialogDescription className="text-sm text-zinc-400">
                        {songTitle ? `Add "${songTitle}" to a playlist` : "Select a playlist to add this song to"}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-500/10 text-red-500 px-3 py-2 rounded-lg text-sm mb-4 border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Create New Flow */}
                    {isCreating ? (
                        <div className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-xl border border-zinc-700/50">
                            <Input
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="New playlist name..."
                                className="bg-transparent border-none text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-500 h-9"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateAndAdd()
                                    if (e.key === "Escape") setIsCreating(false)
                                }}
                                disabled={isSubmitting}
                            />
                            <Button 
                                size="sm"
                                variant="secondary"
                                className="h-8 select-none"
                                onClick={handleCreateAndAdd}
                                disabled={!newPlaylistName.trim() || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 text-zinc-400 hover:text-white"
                                onClick={() => setIsCreating(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <button
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-700/50 text-zinc-300 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all text-left font-medium select-none cursor-pointer group"
                            onClick={() => setIsCreating(true)}
                        >
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                                <Image src="/icons/addtoqueue.svg" alt="New Playlist" width={18} height={18} className="opacity-80 group-hover:opacity-100" />
                            </div>
                            New Playlist
                        </button>
                    )}

                    {/* Existing Playlists List */}
                    <div className="pt-2">
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-1">Your Playlists</div>
                        <ScrollArea className="h-[240px] pr-4 -mr-4">
                            {playlists.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                                        <Image src="/icons/playlist.svg" alt="Playlist" width={20} height={20} className="opacity-40" />
                                    </div>
                                    <p className="text-zinc-500 text-sm">No playlists found</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {playlists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            className="w-full flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all text-left cursor-pointer group"
                                            onClick={() => handleAddToExisting(playlist)}
                                            disabled={isSubmitting}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-700/50 transition-colors">
                                                <Image src="/icons/playlist.svg" alt="Playlist" width={18} height={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate font-medium">{playlist.name}</span>
                                                <span className="text-xs text-zinc-500">{playlist.songCount} songs</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
