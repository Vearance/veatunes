"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
    const pathname = usePathname();
    // TODO: fix 'all song' path
    const linkClass = (href: string) =>
        cn(
            "flex items-center gap-4 px-2 py-2 rounded-md text-sm transition-colors text-secondary",
            pathname === href
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-800 hover:text-white"
        );

    return (
        <aside className="w-[259px] bg-foreground ml-[10px] mr-[5px] mb-[10px] p-4 rounded-2xl">
            <ScrollArea className="h-full">
                <div className="flex items-center gap-4 px-2 py-2 text-sm text-sidebar mb-2">
                    <Image
                        src="/icons/library.svg"
                        alt="Library"
                        width={22}
                        height={22}
                    />
                    <span className="ml-[-2px]">My Library</span>
                </div>

                <nav className="space-y-1 font-satoshi">
                    <Link href="/songs" className={linkClass("/songs")}>  
                        <Image
                            src="/icons/song.svg"
                            alt="Songs"
                            width={20}
                            height={20}
                        />
                        <span>All Songs</span>
                    </Link>

                    <Link href="/album" className={linkClass("/album")}>
                        <Image
                            src="/icons/album.svg"
                            alt="Albums"
                            width={20}
                            height={20}
                        />
                        <span>Albums</span>
                    </Link>

                    <Link href="/artist" className={linkClass("/artist")}>
                        <Image
                            src="/icons/artist.svg"
                            alt="Artist"
                            width={20}
                            height={20}
                        />
                        <span>Artists</span>
                    </Link>
                </nav>

                <div className="px-[8px]">
                    <Separator className="my-1.5 bg-border" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    <Link href="/playlist" className={linkClass("/playlist")}>
                        <Image
                            src="/icons/playlist.svg"
                            alt="Playlist"
                            width={20}
                            height={20}
                        />
                        <span>Playlists</span>
                    </Link>
                </nav>

                <div className="px-[8px]">
                    <Separator className="my-1.5 bg-border" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    <Link href="/moods" className={linkClass("/moods")}>
                        <Image
                            src="/icons/moods.svg"
                            alt="Moods"
                            width={20}
                            height={20}
                        />
                        <span>Moods</span>
                    </Link>
                </nav>
            </ScrollArea>
        </aside>
    );
}
