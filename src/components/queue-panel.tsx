"use client";

import Image from "next/image";
import { usePlayer } from "@/components/player-context";
import { useUI } from "@/components/ui-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, X, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/song-utils";

export function QueuePanel() {
    const {
        currentTrack,
        queue,
        isPlaying,
        clearQueue,
        removeTrackFromQueue,
        skipToTrackInQueue,
    } = usePlayer();
    const { queueOpen, toggleQueue, isMobile } = useUI();

    if (!queueOpen) return null;

    const currentIndex = currentTrack
        ? queue.findIndex(t => t.id === currentTrack.id)
        : -1;
    const upNext = currentIndex >= 0
        ? queue.slice(currentIndex + 1)
        : queue;
    const upNextStartIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

    return (
        <>
            {/* mobile backdrop */}
            {isMobile && (
                <div
                    className="fixed inset-0 bg-black/60 z-40"
                    onClick={toggleQueue}
                />
            )}
            <aside className={cn(
                "bg-foreground flex flex-col overflow-hidden shrink-0 transition-all duration-300",
                isMobile
                    ? "fixed inset-x-0 bottom-0 top-0 z-50 rounded-none"
                    : "w-[320px] mb-[10px] mr-[10px] rounded-2xl"
            )}>
            {/* header */}
            <div className="flex items-center justify-between p-4 pb-2 shrink-0">
                <h2 className="text-sm font-semibold text-zinc-100">Queue</h2>
                <div className="flex items-center">
                    {queue.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearQueue}
                            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-transparent cursor-pointer select-none"
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleQueue}
                        className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-transparent cursor-pointer select-none"
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            {/* scrollable content — using native scroll instead of Radix ScrollArea */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 custom-scrollbar">
                {/* now playing */}
                {currentTrack && (
                    <div className="px-2 pb-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Now Playing</p>
                        <div className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg">
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                <Image
                                    src={currentTrack.coverArt || "/albumplaceholder.svg"}
                                    alt={currentTrack.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-zinc-100 truncate font-medium">{currentTrack.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{currentTrack.artist}</p>
                            </div>
                            {isPlaying && (
                                <div className="flex items-end gap-[3px] mr-1 h-4">
                                    <span className="w-[3px] bg-green-400 rounded-sm animate-[equalizer_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                                    <span className="w-[3px] bg-green-400 rounded-sm animate-[equalizer_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0.2s" }} />
                                    <span className="w-[3px] bg-green-400 rounded-sm animate-[equalizer_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0.4s" }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="px-2">
                    <Separator className="my-1 bg-border/50" />
                </div>

                {/* queue list */}
                <div className="px-2 pt-2 pb-4">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                        Up Next {upNext.length > 0 && `(${upNext.length})`}
                    </p>

                    {upNext.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-8">Queue is empty</p>
                    ) : (
                        <div className="space-y-0.5">
                            {upNext.map((track, i) => {
                                const queueIndex = upNextStartIndex + i;
                                return (
                                    <div
                                        key={`${track.id}-${queueIndex}`}
                                        onClick={() => skipToTrackInQueue(queueIndex)}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer group"
                                    >
                                        <div className="relative w-9 h-9 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                            <Image
                                                src={track.coverArt || "/albumplaceholder.svg"}
                                                alt={track.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-zinc-200 truncate">{track.name}</p>
                                            <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeTrackFromQueue(track.id);
                                            }}
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-200 hover:bg-transparent cursor-pointer select-none shrink-0"
                                        >
                                            <Minus size={14} />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
        </>
    );
}
