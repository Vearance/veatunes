"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUI } from "@/components/ui-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarCollapsed, toggleSidebar } = useUI();

    const linkClass = (href: string) =>
        cn(
            "flex items-center gap-4 px-2 py-2 rounded-md text-sm transition-colors text-secondary",
            pathname === href
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-800 hover:text-white",
            sidebarCollapsed && "justify-center px-0"
        );

    const navItems = [
        { href: "/songs", icon: "/icons/song.svg", label: "All Songs" },
        { href: "/album", icon: "/icons/album.svg", label: "Albums" },
        { href: "/artist", icon: "/icons/artist.svg", label: "Artists" },
    ];

    const navItems2 = [
        { href: "/playlist", icon: "/icons/playlist.svg", label: "Playlists" },
    ];

    const navItems3 = [
        { href: "/moods", icon: "/icons/moods.svg", label: "Moods" },
    ];

    return (
        <aside
            className={cn(
                "bg-foreground ml-[10px] mr-[5px] mb-[10px] rounded-2xl transition-all duration-300 flex flex-col shrink-0",
                sidebarCollapsed ? "w-[64px] p-2" : "w-[259px] p-4"
            )}
        >
            <ScrollArea className="flex-1">
                {/* library header */}
                <div className={cn(
                    "flex items-center gap-4 px-2 py-2 text-sm text-sidebar mb-2",
                    sidebarCollapsed && "justify-center px-0"
                )}>
                    <Image
                        src="/icons/library.svg"
                        alt="Library"
                        width={22}
                        height={22}
                    />
                    {!sidebarCollapsed && <span className="ml-[-2px]">My Library</span>}
                </div>

                <nav className="space-y-1 font-satoshi">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            <Image src={item.icon} alt={item.label} width={20} height={20} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className={cn("px-[8px]", sidebarCollapsed && "px-1")}>
                    <Separator className="my-1.5 bg-border" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    {navItems2.map(item => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            <Image src={item.icon} alt={item.label} width={20} height={20} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className={cn("px-[8px]", sidebarCollapsed && "px-1")}>
                    <Separator className="my-1.5 bg-border" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    {navItems3.map(item => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            <Image src={item.icon} alt={item.label} width={20} height={20} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </ScrollArea>

            {/* collapse toggle */}
            <div className={cn("mt-2 flex", sidebarCollapsed ? "justify-center" : "justify-end px-2")}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </Button>
            </div>
        </aside>
    );
}
