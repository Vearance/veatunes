"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Search, Settings, ChartNoAxesColumn, UserRound } from "lucide-react";
import { useNavidrome } from '@/components/navidrome-context';
import { usePlayer } from '@/components/player-context';
import { User, Artist, Album, Song } from '@/lib/navidrome';
import { Button } from "@/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "@/lib/song-utils";

export default function Header() {
    const { api, isConnected } = useNavidrome();
    const { songToTrack, playTrack } = usePlayer();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ artists: Artist[]; albums: Album[]; songs: Song[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!api || !isConnected) {
                setLoading(false);
                return;
            }

            try {
                const user = await api.getUserInfo();
                setUserInfo(user);
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [api, isConnected]);

    // debounced search
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setSearchResults(null);
            setShowResults(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            if (!api) return;
            setIsSearching(true);
            try {
                const results = await api.search(value, 5, 5, 5);
                setSearchResults(results);
                setShowResults(true);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }, [api]);

    // close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // close on Escape
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowResults(false);
            (e.target as HTMLInputElement).blur();
        }
    };

    const closeAndNavigate = (href: string) => {
        setShowResults(false);
        setSearchQuery("");
        router.push(href);
    };

    const handlePlaySong = (song: Song) => {
        setShowResults(false);
        setSearchQuery("");
        const track = songToTrack(song);
        playTrack(track);
    };

    const handleLogout = () => {
        localStorage.removeItem('navidrome-config');
        window.location.reload();
    };

    const hasResults = searchResults && (
        searchResults.artists.length > 0 ||
        searchResults.albums.length > 0 ||
        searchResults.songs.length > 0
    );

    if (!userInfo) {
        return (
            <Link href="/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                    <UserRound className="w-4 h-4" />
                </Button>
            </Link>
        );
    }

    return (
        <header className="grid grid-cols-[274px_1fr_274px] items-center mb-4">
            <div className="flex justify-center">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={115}
                        height={39}
                        className="object-contain"
                    />
                </Link>
            </div>

            {/* search bar with dropdown */}
            <div className="flex items-center justify-self-center relative" ref={searchRef}>
                <div className="flex items-center gap-2 w-full max-w-[331px]">
                    <Search
                        className="text-secondary shrink-0 mr-1"
                        size={24} />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => { if (searchResults) setShowResults(true); }}
                        onKeyDown={handleKeyDown}
                        className="bg-input text-zinc-300 placeholder-zinc-500 font-satoshi rounded-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {/* search results dropdown */}
                {showResults && searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-foreground border border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden max-h-[420px] overflow-y-auto custom-scrollbar w-[370px]">
                        {isSearching ? (
                            <p className="text-zinc-500 text-sm p-4 text-center">Searching…</p>
                        ) : !hasResults ? (
                            <p className="text-zinc-500 text-sm p-4 text-center">No results found</p>
                        ) : (
                            <div className="py-1">
                                {/* artists */}
                                {searchResults!.artists.length > 0 && (
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2">Artists</p>
                                        {searchResults!.artists.map((artist) => (
                                            <button
                                                key={artist.id}
                                                onClick={() => closeAndNavigate(`/artist/${artist.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                                                    <Image
                                                        src={artist.coverArt && api ? api.getCoverArtUrl(artist.coverArt, 50) : "/artistplaceholder.svg"}
                                                        alt={artist.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <p className="text-sm text-zinc-200 truncate">{artist.name}</p>
                                                    <p className="text-xs text-zinc-500">{artist.albumCount} album{artist.albumCount !== 1 ? 's' : ''}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* albums */}
                                {searchResults!.albums.length > 0 && (
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2 mt-1">Albums</p>
                                        {searchResults!.albums.map((album) => (
                                            <button
                                                key={album.id}
                                                onClick={() => closeAndNavigate(`/album/${album.id}`)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                <div className="relative w-8 h-8 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                                    <Image
                                                        src={album.coverArt && api ? api.getCoverArtUrl(album.coverArt, 50) : "/albumplaceholder.svg"}
                                                        alt={album.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <p className="text-sm text-zinc-200 truncate">{album.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* songs */}
                                {searchResults!.songs.length > 0 && (
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2 mt-1">Songs</p>
                                        {searchResults!.songs.map((song) => (
                                            <button
                                                key={song.id}
                                                onClick={() => handlePlaySong(song)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                <div className="relative w-8 h-8 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                                    <Image
                                                        src={song.coverArt && api ? api.getCoverArtUrl(song.coverArt, 50) : "/songplaceholder.svg"}
                                                        alt={song.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="text-left min-w-0 flex-1">
                                                    <p className="text-sm text-zinc-200 truncate">{song.title}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
                                                </div>
                                                <span className="text-xs text-zinc-500 flex-shrink-0">{formatDuration(song.duration)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-4 pr-5">
                <TooltipProvider delayDuration={100}>
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <ChartNoAxesColumn
                                        className="text-secondary cursor-pointer"
                                        size={24}
                                    />
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs bg-input text-primary">
                                Activity
                            </TooltipContent>
                        </Tooltip>

                        <DropdownMenuContent className="w-40">
                            <DropdownMenuItem>Now Playing</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Server Uptime</DropdownMenuItem>
                            <DropdownMenuItem>Folders:</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Quick scan & Full scan</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Settings
                                        className="text-secondary cursor-pointer"
                                        size={24}
                                    />
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs bg-input text-primary">
                                Settings
                            </TooltipContent>
                        </Tooltip>

                        <DropdownMenuContent className="w-40">
                            <DropdownMenuItem>Personal</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Library</DropdownMenuItem>
                            <DropdownMenuItem>Missing Files</DropdownMenuItem>
                            <DropdownMenuItem>About</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipProvider>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="cursor-pointer">
                            <AvatarImage
                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${userInfo.username}&backgroundColor=696969&radius=50&size=34&textColor=DEDEDE&scale=75`}
                                alt={userInfo.username}
                            />
                            <AvatarFallback>{userInfo.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
