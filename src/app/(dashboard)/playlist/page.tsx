"use client"

import { useState } from "react"
import { useNavidrome } from "@/components/navidrome-context"
import PlaylistCard from "@/components/playlist-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PlaylistPage() {
    const { playlists, playlistsLoading, createPlaylist } = useNavidrome()
    const [showInput, setShowInput] = useState(false)
    const [newName, setNewName] = useState("")
    const [creating, setCreating] = useState(false)

    const handleCreate = async () => {
        const trimmed = newName.trim()
        if (!trimmed) return

        setCreating(true)
        try {
            await createPlaylist(trimmed)
            setNewName("")
            setShowInput(false)
        } catch (err) {
            console.error("Failed to create playlist:", err)
        } finally {
            setCreating(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCreate()
        if (e.key === "Escape") {
            setShowInput(false)
            setNewName("")
        }
    }

    if (playlistsLoading) {
        return (
            <div className="p-4">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 md:gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-[140px] sm:w-[170px] flex flex-col space-y-2 animate-pulse">
                            <Skeleton className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-lg bg-zinc-800" />
                            <Skeleton className="h-2 w-3/4 bg-zinc-700" />
                            <Skeleton className="h-1.5 w-1/2 bg-zinc-700" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 md:gap-6">
                {playlists.map(pl => (
                    <PlaylistCard key={pl.id} playlist={pl} />
                ))}

                {/* new playlist card */}
                {!showInput ? (
                    <div
                        onClick={() => setShowInput(true)}
                        className="w-[140px] sm:w-[170px] flex flex-col cursor-pointer group"
                    >
                        <div className="relative flex flex-col items-center">
                            <div className="bg-[#73737326] w-[110px] sm:w-[133px] h-[3px] rounded-t-[7.25px]" />
                            <div className="h-[1px]" />
                            <div className="bg-[#7373734D] w-[128px] sm:w-[154px] h-[6px] rounded-t-[7.25px]" />
                            <div className="h-[1px]" />
                            <div className="relative w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-lg overflow-hidden bg-zinc-800/50 border-2 border-dashed border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 group-hover:bg-zinc-800 transition-colors">
                                <Plus size={36} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                            </div>
                        </div>
                        <div className="mt-2 mb-1">
                            <p className="text-sm font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                New Playlist
                            </p>
                        </div>
                        <p className="text-xs text-secondary">
                            Create a new playlist
                        </p>
                    </div>
                ) : (
                    <div className="w-[140px] sm:w-[170px] flex flex-col">
                        <div className="relative flex flex-col items-center">
                            <div className="bg-[#73737326] w-[110px] sm:w-[133px] h-[3px] rounded-t-[7.25px]" />
                            <div className="h-[1px]" />
                            <div className="bg-[#7373734D] w-[128px] sm:w-[154px] h-[6px] rounded-t-[7.25px]" />
                            <div className="h-[1px]" />
                            <div className="relative w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-lg overflow-hidden bg-zinc-800 border-2 border-zinc-600 flex flex-col items-center justify-center gap-3 p-4">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Playlist name..."
                                    autoFocus
                                    disabled={creating}
                                    className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-50 text-center"
                                />
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCreate}
                                        disabled={!newName.trim() || creating}
                                        className="h-8 w-8 p-0 rounded-full text-green-400 hover:text-green-300 hover:bg-zinc-700 cursor-pointer disabled:opacity-30"
                                    >
                                        <Check size={18} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setShowInput(false); setNewName("") }}
                                        disabled={creating}
                                        className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                                    >
                                        <X size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 mb-1">
                            <p className="text-sm font-medium text-zinc-300">
                                New Playlist
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
