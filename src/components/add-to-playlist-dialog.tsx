import { useState, useEffect } from "react"
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
import { Plus, ListMusic, Loader2 } from "lucide-react"

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

    // Reset state when dialong opens/closes
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
            <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Add to Playlist</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {songTitle ? `Add "${songTitle}" to a playlist` : "Select a playlist to add this song to."}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-2 rounded-md text-sm mb-2">
                        {error}
                    </div>
                )}

                <div className="space-y-4 py-2">
                    {/* Create New Flow */}
                    {isCreating ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="New playlist name..."
                                className="bg-zinc-800/50 border-zinc-700"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateAndAdd()
                                    if (e.key === "Escape") setIsCreating(false)
                                }}
                                disabled={isSubmitting}
                            />
                            <Button 
                                size="sm" 
                                onClick={handleCreateAndAdd}
                                disabled={!newPlaylistName.trim() || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setIsCreating(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full justify-start border-dashed border-zinc-700 hover:bg-zinc-800 transition"
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Playlist
                        </Button>
                    )}

                    {/* Existing Playlists List */}
                    <ScrollArea className="h-[200px] rounded-md border border-zinc-800 p-2">
                        {playlists.length === 0 ? (
                            <p className="text-zinc-500 text-sm text-center py-4">No playlists yet.</p>
                        ) : (
                            <div className="space-y-1 my-1">
                                {playlists.map((playlist) => (
                                    <Button
                                        key={playlist.id}
                                        variant="ghost"
                                        className="w-full justify-start font-normal text-zinc-300 hover:text-white hover:bg-zinc-800"
                                        onClick={() => handleAddToExisting(playlist)}
                                        disabled={isSubmitting}
                                    >
                                        <ListMusic className="mr-3 h-4 w-4 opacity-50" />
                                        <span className="truncate">{playlist.name}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
