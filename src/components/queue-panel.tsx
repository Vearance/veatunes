"use client";

import Image from "next/image";
import { usePlayer } from "@/components/player-context";
import { useUI } from "@/components/ui-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Trash2 } from "lucide-react";
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
    const { queueOpen, toggleQueue } = useUI();

    if (!queueOpen) return null;

    return (
        <aside className="w-[320px] bg-foreground mb-[10px] mr-[10px] rounded-2xl flex flex-col overflow-hidden shrink-0 transition-all duration-300">
            {/* header */}
            <div className="flex items-center justify-between p-4 pb-2">
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

            <ScrollArea className="flex-1 px-2">
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
                                <div className="flex items-center gap-[2px] mr-1">
                                    <span className="w-[3px] h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                                    <span className="w-[3px] h-[10px] bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                                    <span className="w-[3px] h-[14px] bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
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
                    {(() => {
                        const currentIndex = currentTrack
                            ? queue.findIndex(t => t.id === currentTrack.id)
                            : -1;
                        const upNext = currentIndex >= 0
                            ? queue.slice(currentIndex + 1)
                            : queue;
                        const upNextStartIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

                        return (
                            <>
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
                                                    <span className="text-xs text-zinc-500 mr-1">
                                                        {formatDuration(track.duration)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeTrackFromQueue(track.id);
                                                        }}
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-200 hover:bg-transparent"
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </ScrollArea>
        </aside>
    );
}
