"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePlayer } from "@/components/player-context";
import { useNavidrome } from "@/components/navidrome-context";
import { useUI } from "@/components/ui-context";
import { StructuredLyrics } from "@/lib/navidrome";
import Image from "next/image";
import { X, MicVocal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LyricsPanel() {
    const { currentTrack, audioRef, seekTo } = usePlayer();
    const { getLyrics } = useNavidrome();
    const { lyricsOpen, toggleLyrics } = useUI();

    const [lyrics, setLyrics] = useState<StructuredLyrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeLineIndex, setActiveLineIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLParagraphElement>(null);
    const lastTrackIdRef = useRef<string | null>(null);

    // Fetch lyrics when track changes
    useEffect(() => {
        if (!currentTrack || currentTrack.id === lastTrackIdRef.current) return;
        lastTrackIdRef.current = currentTrack.id;

        const fetchLyrics = async () => {
            setLoading(true);
            setActiveLineIndex(-1);
            try {
                const allLyrics = await getLyrics(currentTrack.id);
                // Prefer synced lyrics, fall back to unsynced
                const synced = allLyrics.find(l => l.synced);
                const unsynced = allLyrics.find(l => !l.synced);
                setLyrics(synced || unsynced || null);
            } catch {
                setLyrics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchLyrics();
    }, [currentTrack, getLyrics]);

    // Reset lyrics when track is cleared
    useEffect(() => {
        if (!currentTrack) {
            setLyrics(null);
            lastTrackIdRef.current = null;
        }
    }, [currentTrack]);

    // Sync active line with playback time
    const updateActiveLine = useCallback(() => {
        if (!lyrics?.synced || !audioRef.current) return;

        const currentTimeMs = audioRef.current.currentTime * 1000;
        const offset = lyrics.offset || 0;
        const adjustedTime = currentTimeMs - offset;

        let newIndex = -1;
        for (let i = lyrics.line.length - 1; i >= 0; i--) {
            if (lyrics.line[i].start !== undefined && lyrics.line[i].start! <= adjustedTime) {
                newIndex = i;
                break;
            }
        }

        setActiveLineIndex(prev => {
            if (prev !== newIndex) return newIndex;
            return prev;
        });
    }, [lyrics, audioRef]);

    useEffect(() => {
        if (!lyrics?.synced || !lyricsOpen) return;

        const audio = audioRef.current;
        if (!audio) return;

        const handler = () => updateActiveLine();
        audio.addEventListener("timeupdate", handler);
        return () => audio.removeEventListener("timeupdate", handler);
    }, [lyrics, lyricsOpen, audioRef, updateActiveLine]);

    // Auto-scroll to active line
    useEffect(() => {
        if (activeLineIndex >= 0 && activeLineRef.current && containerRef.current) {
            const container = containerRef.current;
            const line = activeLineRef.current;
            const containerHeight = container.clientHeight;
            const lineTop = line.offsetTop;
            const lineHeight = line.clientHeight;

            // Center the active line in the container
            const scrollTarget = lineTop - containerHeight / 2 + lineHeight / 2;

            container.scrollTo({
                top: scrollTarget,
                behavior: "smooth",
            });
        }
    }, [activeLineIndex]);

    // Close on Escape
    useEffect(() => {
        if (!lyricsOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") toggleLyrics();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [lyricsOpen, toggleLyrics]);

    if (!lyricsOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col">
            {/* Background: blurred album art */}
            <div className="absolute inset-0 overflow-hidden">
                {currentTrack?.coverArt ? (
                    <Image
                        src={currentTrack.coverArt}
                        alt=""
                        fill
                        className="object-cover scale-110 blur-[80px] brightness-[0.3]"
                        draggable={false}
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
                )}
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-5 pb-3 z-10">
                <div className="flex items-center gap-3 min-w-0">
                    {currentTrack?.coverArt && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <Image
                                src={currentTrack.coverArt}
                                alt={currentTrack.name}
                                fill
                                className="object-cover"
                                draggable={false}
                            />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {currentTrack?.name ?? "No track playing"}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                            {currentTrack?.artist ?? ""}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLyrics}
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer select-none shrink-0"
                >
                    <X size={20} />
                </Button>
            </div>

            {/* Lyrics content */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-y-auto px-6 md:px-16 lg:px-32 pb-32 z-10 custom-scrollbar"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                            <p className="text-sm text-zinc-400">Loading lyrics...</p>
                        </div>
                    </div>
                ) : !lyrics || lyrics.line.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <MicVocal size={48} className="text-zinc-600" />
                            <div>
                                <p className="text-lg font-medium text-zinc-400">No lyrics available</p>
                                <p className="text-sm text-zinc-600 mt-1">
                                    Lyrics weren&apos;t found for this track
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-[30vh]">
                        {lyrics.line.map((line, index) => {
                            const isActive = lyrics.synced && index === activeLineIndex;
                            const isPast = lyrics.synced && activeLineIndex >= 0 && index < activeLineIndex;
                            const isEmpty = !line.value.trim();
                            const isClickable = lyrics.synced && line.start !== undefined;

                            if (isEmpty) {
                                return <div key={index} className="h-8" />;
                            }

                            return (
                                <p
                                    key={index}
                                    ref={isActive ? activeLineRef : null}
                                    onClick={() => {
                                        if (isClickable) {
                                            seekTo((line.start! + (lyrics.offset ?? 0)) / 1000);
                                        }
                                    }}
                                    className={cn(
                                        "text-center py-2 px-4 rounded-lg transition-all duration-500 ease-out w-full max-w-2xl",
                                        isClickable && "cursor-pointer hover:brightness-125",
                                        lyrics.synced && isActive && "text-white text-2xl md:text-3xl font-bold scale-[1.02]",
                                        lyrics.synced && isPast && "text-zinc-600 text-lg md:text-xl font-medium hover:text-zinc-400",
                                        lyrics.synced && !isActive && !isPast && "text-zinc-500 text-lg md:text-xl font-medium hover:text-zinc-300",
                                        !lyrics.synced && "text-zinc-300 text-base md:text-lg font-normal"
                                    )}
                                    style={{
                                        transform: isActive ? "scale(1.02)" : "scale(1)",
                                    }}
                                >
                                    {line.value}
                                </p>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
