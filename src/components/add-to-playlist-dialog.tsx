import { useState, useEffect } from "react"
import Image from "next/image"
import { useNavidrome } from "@/components/navidrome-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Playlist } from "@/lib/navidrome"
import { Loader2, Plus } from "lucide-react"

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
            <DialogContent className="sm:max-w-[400px] bg-[#1a1a1d] border-zinc-800/80 text-white rounded-2xl p-0 shadow-2xl overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-1">
                    <DialogTitle className="text-lg font-semibold text-zinc-100">Add to Playlist</DialogTitle>
                    <DialogDescription className="text-sm text-zinc-500">
                        {songTitle ? `"${songTitle}"` : "Select a playlist"}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="mx-5 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm border border-red-500/20">
                        {error}
                    </div>
                )}

                <div className="px-5 pb-5">
                    {/* Create New Flow */}
                    {isCreating ? (
                        <div className="flex items-center gap-2 bg-zinc-800/60 p-2.5 rounded-xl mb-3">
                            <Input
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Playlist name..."
                                className="bg-transparent border-none text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-600 h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateAndAdd()
                                    if (e.key === "Escape") setIsCreating(false)
                                }}
                                disabled={isSubmitting}
                            />
                            <Button
                                size="sm"
                                className="h-7 px-3 text-xs bg-white text-black hover:bg-zinc-200 rounded-lg shrink-0"
                                onClick={handleCreateAndAdd}
                                disabled={!newPlaylistName.trim() || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-zinc-500 hover:text-white shrink-0"
                                onClick={() => setIsCreating(false)}
                                disabled={isSubmitting}
                            >
                                ✕
                            </Button>
                        </div>
                    ) : (
                        <button
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all text-left text-sm font-medium select-none cursor-pointer mb-3"
                            onClick={() => setIsCreating(true)}
                        >
                            <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center shrink-0">
                                <Plus size={16} className="opacity-70" />
                            </div>
                            New Playlist
                        </button>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-zinc-800/80 mb-3" />

                    {/* Existing Playlists */}
                    <div className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider mb-2 px-1">
                        Playlists
                    </div>

                    <div className="max-h-[260px] overflow-y-auto custom-scrollbar -mx-1 px-1">
                        {playlists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-zinc-600 text-sm">No playlists yet</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {playlists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        className="w-full flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all text-left cursor-pointer group disabled:opacity-40"
                                        onClick={() => handleAddToExisting(playlist)}
                                        disabled={isSubmitting}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-700/50 transition-colors">
                                            <Image src="/icons/playlist.svg" alt="" width={16} height={16} className="opacity-40 group-hover:opacity-80 transition-opacity" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="truncate text-sm font-medium">{playlist.name}</span>
                                            <span className="text-[11px] text-zinc-600">{playlist.songCount} song{playlist.songCount !== 1 ? "s" : ""}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
