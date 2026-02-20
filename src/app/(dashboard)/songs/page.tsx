"use client"

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNavidrome } from "@/components/navidrome-context";
import { usePlayer } from "@/components/player-context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Song } from "@/lib/navidrome";
import { formatDuration, formatDurationVerbose } from "@/lib/song-utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Search,
    ChevronDown,
} from "lucide-react";
import { AddToPlaylistDialog } from "@/components/add-to-playlist-dialog";

type SortField = "title" | "artist" | "album" | "duration";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 50;

export default function SongsPage() {
    const { api, isConnected, starItem, unstarItem } = useNavidrome();
    const {
        songToTrack,
        playTrack,
        playArtist,
        addToQueue,
        currentTrack,
        isPlaying,
        setIsPlaying,
        shuffle,
        toggleShuffle,
    } = usePlayer();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortField>("title");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const [playlistDialogSong, setPlaylistDialogSong] = useState<Song | null>(null);

    // fetch all songs with batched API calls
    const fetchAllSongs = useCallback(async () => {
        if (!api) return;
        setLoading(true);

        try {
            const batchSize = 500;
            let offset = 0;
            let allSongs: Song[] = [];
            let hasMore = true;

            while (hasMore) {
                const batch = await api.getAllSongs(batchSize, offset);
                allSongs = [...allSongs, ...batch];
                if (batch.length < batchSize) {
                    hasMore = false;
                }
                offset += batchSize;
            }

            setSongs(allSongs);
        } catch (error) {
            console.error("Failed to fetch songs:", error);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (!isConnected || !api) return;
        fetchAllSongs();
    }, [isConnected, api, fetchAllSongs]);

    // sort songs
    const sortedSongs = useMemo(() => {
        const sorted = [...songs].sort((a, b) => {
            let compareA: string | number;
            let compareB: string | number;

            switch (sortBy) {
                case "title":
                    compareA = a.title.toLowerCase();
                    compareB = b.title.toLowerCase();
                    break;
                case "artist":
                    compareA = a.artist.toLowerCase();
                    compareB = b.artist.toLowerCase();
                    break;
                case "album":
                    compareA = a.album.toLowerCase();
                    compareB = b.album.toLowerCase();
                    break;
                case "duration":
                    compareA = a.duration || 0;
                    compareB = b.duration || 0;
                    break;
                default:
                    return 0;
            }

            if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
            if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [songs, sortBy, sortOrder]);

    // filter by search
    const filteredSongs = useMemo(() => {
        if (!searchQuery.trim()) return sortedSongs;
        const query = searchQuery.toLowerCase();
        return sortedSongs.filter(
            (song) =>
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query) ||
                song.album.toLowerCase().includes(query)
        );
    }, [sortedSongs, searchQuery]);

    // pagination
    const totalPages = Math.ceil(filteredSongs.length / PAGE_SIZE);

    const paginatedSongs = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredSongs.slice(start, start + PAGE_SIZE);
    }, [filteredSongs, currentPage]);

    // reset page when search/sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortBy, sortOrder]);

    const totalDuration = useMemo(
        () => filteredSongs.reduce((sum, s) => sum + (s.duration ?? 0), 0),
        [filteredSongs]
    );

    const isPlayingTheseSongs = currentTrack && songs.some(s => s.id === currentTrack.id);

    const handleSongFavorite = async (song: Song) => {
        if (!api) return;
        try {
            if (song.starred) {
                await unstarItem(song.id, "song");
                setSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: undefined } : s
                    )
                );
            } else {
                await starItem(song.id, "song");
                setSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: "true" } : s
                    )
                );
            }
        } catch (error) {
            console.error("Failed to toggle song favorite:", error);
        }
    };

    const handlePlayPause = () => {
        if (isPlayingTheseSongs && isPlaying) {
            setIsPlaying(false);
        } else if (filteredSongs.length > 0) {
            playArtist(filteredSongs);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const sortArrow = (field: SortField) => {
        if (sortBy !== field) return "";
        return sortOrder === "asc" ? " ↑" : " ↓";
    };

    // generate visible page numbers
    const getPageNumbers = (): (number | "...")[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "...")[] = [1];
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        if (totalPages > 1) pages.push(totalPages);
        return pages;
    };

    if (loading) {
        return (
            <div className="p-4 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                    <Skeleton className="h-8 w-8 rounded bg-zinc-800" />
                    <div className="flex-1" />
                    <Skeleton className="h-8 w-48 rounded bg-zinc-800" />
                </div>
                <div className="space-y-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full bg-zinc-800 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-4 space-y-4">
            {/* action bar: play, shuffle, spacer, song count, search */}
            <div className="flex items-center gap-3 md:gap-5">
                <Button
                    asChild
                    variant="ghost"
                    onClick={handlePlayPause}
                    className="h-8 w-8 text-border hover:text-secondary hover:bg-transparent cursor-pointer select-none p-0"
                >
                    <Image
                        src={isPlayingTheseSongs && isPlaying ? "/icons/pausetosc.svg" : "/icons/playtosc.svg"}
                        alt={isPlayingTheseSongs && isPlaying ? "Pause" : "Play All"}
                        width={24}
                        height={24}
                        draggable={false}
                    />
                </Button>

                <Button
                    asChild
                    variant="ghost"
                    onClick={toggleShuffle}
                    className={`h-8 w-8 text-border hover:text-secondary hover:bg-transparent cursor-pointer select-none p-0 ${shuffle ? 'opacity-100' : 'opacity-40'}`}
                >
                    <Image
                        src="/icons/shuffle.svg"
                        alt="Toggle Shuffle"
                        width={22}
                        height={22}
                        draggable={false}
                    />
                </Button>

                <div className="flex-1" />

                {/* inline search */}
                <div className="relative w-40 md:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search songs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-input text-zinc-300 placeholder-zinc-500 font-satoshi rounded-lg border-none pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    />
                </div>
            </div>

            {/* column headers — clickable for sorting */}
            <div>
                <div className="flex items-center text-xs text-zinc-500 px-2 select-none">
                    <span className="w-8 text-right">#</span>
                    <span className="w-10 ml-3 hidden sm:block" />
                    <button
                        onClick={() => handleSort("title")}
                        className="flex-1 ml-3 text-left hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                        Title{sortArrow("title")}
                    </button>
                    <button
                        onClick={() => handleSort("album")}
                        className="w-[140px] text-left hidden md:block hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                        Album{sortArrow("album")}
                    </button>
                    <button
                        onClick={() => handleSort("duration")}
                        className="w-12 text-right hover:text-zinc-300 transition-colors cursor-pointer mr-0 md:mr-12"
                    >
                        Time{sortArrow("duration")}
                    </button>
                </div>

                <Separator className="my-1.5 h-[2px] bg-border/75" />

                {/* song list */}
                {paginatedSongs.length === 0 ? (
                    <p className="text-zinc-400 text-center py-8">
                        {songs.length === 0 ? "No songs found" : "No songs match your search"}
                    </p>
                ) : (
                    <div>
                        {paginatedSongs.map((song, index) => {
                            const coverUrl =
                                song.coverArt && api
                                    ? api.getCoverArtUrl(song.coverArt, 50)
                                    : "/songplaceholder.svg";
                            const globalIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
                            const isCurrentSong = currentTrack?.id === song.id;

                            return (
                                <div
                                    key={song.id}
                                    onClick={() => {
                                        const track = songToTrack(song);
                                        playTrack(track);
                                    }}
                                    className={`flex items-center p-2 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer ${isCurrentSong ? 'bg-zinc-800/50' : ''}`}
                                >
                                    {/* index / play indicator */}
                                    <div className="w-8 text-right text-zinc-500 text-sm">
                                        {isCurrentSong && isPlaying ? (
                                            <Image
                                                src="/icons/pause.svg"
                                                alt="Playing"
                                                width={12}
                                                height={12}
                                                className="ml-auto"
                                            />
                                        ) : (
                                            globalIndex
                                        )}
                                    </div>

                                    {/* cover art */}
                                    <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-zinc-800 ml-3 hidden sm:block">
                                        <Image
                                            src={coverUrl}
                                            alt={song.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* title + artist */}
                                    <div className="flex-1 min-w-0 ml-3">
                                        <p className={`truncate text-sm font-medium ${isCurrentSong ? 'text-white' : 'text-zinc-200'}`}>
                                            {song.title}
                                        </p>
                                        <p className="text-zinc-500 truncate text-xs">
                                            <Link
                                                href={`/artist/${song.artistId}`}
                                                className="hover:text-zinc-300 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {song.artist}
                                            </Link>
                                        </p>
                                    </div>

                                    {/* album */}
                                    <div className="w-[140px] text-left hidden md:block">
                                        <Link
                                            href={`/album/${song.albumId}`}
                                            className="text-xs text-zinc-500 hover:text-zinc-300 hover:underline truncate block"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {song.album}
                                        </Link>
                                    </div>

                                    {/* duration */}
                                    <span className="text-zinc-500 text-sm w-12 text-right">
                                        {formatDuration(song.duration)}
                                    </span>

                                    {/* actions */}
                                    <div
                                        className="hidden sm:flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button
                                            onClick={() => handleSongFavorite(song)}
                                            variant="ghost"
                                            size="sm"
                                            className="w-7 h-7 p-0 hover:bg-transparent"
                                        >
                                            {song.starred ? (
                                                <Image
                                                    src="/icons/heartfilled.svg"
                                                    alt="Favorited"
                                                    width={16}
                                                    height={16}
                                                />
                                            ) : (
                                                <Image
                                                    src="/icons/heart.svg"
                                                    alt="Favorite"
                                                    width={16}
                                                    height={16}
                                                    className="opacity-60"
                                                />
                                            )}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-7 h-7 p-0 hover:bg-transparent"
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const track = songToTrack(song);
                                                        addToQueue(track);
                                                    }}
                                                >
                                                    Add to Queue
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPlaylistDialogSong(song);
                                                    }}
                                                >
                                                    Add to Playlist
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSongFavorite(song);
                                                    }}
                                                >
                                                    {song.starred ? "Remove from Favorites" : "Add to Favorites"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </Button>

                    {getPageNumbers().map((page, i) =>
                        page === "..." ? (
                            <span key={`dots-${i}`} className="text-zinc-500 px-1 text-sm">
                                …
                            </span>
                        ) : (
                            <Button
                                key={page}
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 p-0 text-sm ${
                                    currentPage === page
                                        ? "bg-zinc-700 text-zinc-100"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                }`}
                            >
                                {page}
                            </Button>
                        )
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            <AddToPlaylistDialog 
                isOpen={!!playlistDialogSong}
                onClose={() => setPlaylistDialogSong(null)}
                songId={playlistDialogSong?.id ?? ""}
                songTitle={playlistDialogSong?.title}
            />
        </div>
    );
}
