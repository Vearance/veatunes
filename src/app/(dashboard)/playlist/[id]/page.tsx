"use client"

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { Playlist, Song } from "@/lib/navidrome";
import { formatDuration, formatDurationVerbose } from "@/lib/song-utils";
import { MoreHorizontal } from "lucide-react";

export default function PlaylistDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { api, isConnected, getPlaylist, deletePlaylist, starItem, unstarItem } = useNavidrome();
    const {
        songToTrack,
        playTrack,
        playArtist,
        currentTrack,
        isPlaying,
        setIsPlaying,
        shuffle,
        toggleShuffle,
        addToQueue,
    } = usePlayer();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    const coverUrl = useMemo(() => {
        if (playlist?.coverArt && api) {
            return api.getCoverArtUrl(playlist.coverArt, 300);
        }
        return "/songplaceholder.svg";
    }, [playlist?.coverArt, api]);

    const totalDuration = useMemo(
        () => songs.reduce((sum, s) => sum + (s.duration ?? 0), 0),
        [songs]
    );

    const isPlayingThisPlaylist = currentTrack && songs.some(s => s.id === currentTrack.id);

    useEffect(() => {
        if (!isConnected || !id) return;

        const fetchPlaylist = async () => {
            try {
                const { playlist: pl, songs: plSongs } = await getPlaylist(id);
                setPlaylist(pl);
                setSongs(plSongs);
            } catch (error) {
                console.error("Failed to fetch playlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [getPlaylist, isConnected, id]);

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

    const handleDeletePlaylist = async () => {
        if (!playlist) return;
        try {
            await deletePlaylist(playlist.id);
            router.push("/playlist");
        } catch (error) {
            console.error("Failed to delete playlist:", error);
        }
    };

    const handlePlayPause = () => {
        if (isPlayingThisPlaylist && isPlaying) {
            setIsPlaying(false);
        } else if (isPlayingThisPlaylist) {
            setIsPlaying(true);
        } else if (songs.length > 0) {
            playArtist(songs);
        }
    };

    if (loading) return <p className="text-zinc-400 p-4">Loading playlist…</p>;
    if (!playlist) return <p className="text-zinc-400 p-4">Playlist not found.</p>;

    return (
        <div className="p-4 space-y-6">
            {/* header section */}
            <div className="flex items-start gap-6">
                <div className="relative w-[170px] h-[170px] rounded-lg overflow-hidden bg-zinc-800">
                    <Image
                        src={coverUrl}
                        alt={`Cover art for ${playlist.name || "Unknown Playlist"}`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col justify-between h-[170px]">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Playlist</p>
                        <h1 className="text-2xl font-semibold text-zinc-100 mt-1">
                            {playlist.name}
                        </h1>
                        {playlist.comment && (
                            <p className="text-sm text-zinc-400 mt-1">{playlist.comment}</p>
                        )}
                        <p className="text-sm text-zinc-500 mt-1">
                            {playlist.songCount} song{playlist.songCount !== 1 ? "s" : ""} •{" "}
                            {formatDurationVerbose(totalDuration)}
                            {playlist.owner && ` • by ${playlist.owner}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <Button
                            asChild
                            variant="ghost"
                            onClick={handlePlayPause}
                            className="h-8 w-8 text-border hover:text-secondary hover:bg-transparent cursor-pointer select-none p-0"
                        >
                            <Image
                                src={isPlayingThisPlaylist && isPlaying ? "/icons/pausetosc.svg" : "/icons/playtosc.svg"}
                                alt={isPlayingThisPlaylist && isPlaying ? "Pause" : "Play"}
                                width={24}
                                height={24}
                                draggable={false}
                            />
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            onClick={toggleShuffle}
                            className={`text-border hover:text-secondary hover:bg-transparent cursor-pointer p-0 ${shuffle ? 'opacity-100' : 'opacity-40'}`}
                        >
                            <Image
                                src="/icons/shuffle.svg"
                                alt="Shuffle"
                                width={22}
                                height={22}
                                draggable={false}
                            />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-border hover:text-secondary hover:bg-transparent cursor-pointer p-0"
                                >
                                    <Image
                                        src="/icons/more-hori.svg"
                                        alt="More"
                                        width={24}
                                        height={24}
                                        draggable={false}
                                    />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={handleDeletePlaylist}
                                    className="text-red-500"
                                >
                                    Delete Playlist
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* column headers */}
            <div>
                <div className="flex items-center text-xs text-zinc-500 px-2">
                    <span className="w-8 text-right">#</span>
                    <span className="w-10 ml-3" />
                    <span className="flex-1 ml-3">Title</span>
                    <span className="w-[140px] text-left hidden md:block">Album</span>
                    <span className="w-12 text-right mr-12">Time</span>
                </div>

                <Separator className="my-1.5 h-[2px] bg-border/75" />

                {/* song list */}
                {songs.length === 0 ? (
                    <p className="text-zinc-400 text-center py-8">This playlist is empty.</p>
                ) : (
                    <div>
                        {songs.map((song, index) => {
                            const songCover =
                                song.coverArt && api
                                    ? api.getCoverArtUrl(song.coverArt, 50)
                                    : "/songplaceholder.svg";
                            const isCurrentSong = currentTrack?.id === song.id;

                            return (
                                <div
                                    key={`${song.id}-${index}`}
                                    onClick={() => {
                                        const track = songToTrack(song);
                                        playTrack(track);
                                    }}
                                    className={`flex items-center p-2 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer ${isCurrentSong ? 'bg-zinc-800/50' : ''}`}
                                >
                                    {/* index / play indicator */}
                                    <div className="w-8 text-right text-zinc-500 text-sm group-hover:hidden">
                                        {isCurrentSong && isPlaying ? (
                                            <Image
                                                src="/icons/pause.svg"
                                                alt="Playing"
                                                width={12}
                                                height={12}
                                                className="ml-auto"
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div className="w-8 hidden group-hover:flex items-center justify-center">
                                        <Image
                                            src="/icons/play.svg"
                                            alt="Play"
                                            width={12}
                                            height={12}
                                        />
                                    </div>

                                    {/* cover art */}
                                    <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-zinc-800 ml-3">
                                        <Image
                                            src={songCover}
                                            alt={song.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* title + artist */}
                                    <div className="flex-1 min-w-0 ml-3" onClick={(e) => e.stopPropagation()}>
                                        <p className={`truncate text-sm font-medium ${isCurrentSong ? 'text-white' : 'text-zinc-200'}`}>
                                            {song.title}
                                        </p>
                                        <p className="text-zinc-500 truncate text-xs">
                                            <Link
                                                href={`/artist/${song.artistId}`}
                                                className="hover:text-zinc-300 hover:underline"
                                            >
                                                {song.artist}
                                            </Link>
                                        </p>
                                    </div>

                                    {/* album */}
                                    <div
                                        className="w-[140px] text-left hidden md:block"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Link
                                            href={`/album/${song.albumId}`}
                                            className="text-xs text-zinc-500 hover:text-zinc-300 hover:underline truncate block"
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
                                        className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                    onClick={() => {
                                                        const track = songToTrack(song);
                                                        addToQueue(track);
                                                    }}
                                                >
                                                    Add to Queue
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleSongFavorite(song)}
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
        </div>
    );
}
