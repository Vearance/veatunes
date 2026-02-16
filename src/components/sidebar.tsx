"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUI } from "@/components/ui-context";
import { ChevronLeft } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarCollapsed, toggleSidebar } = useUI();

    const linkClass = (href: string) =>
        cn(
            "flex items-center gap-4 px-2 py-2 rounded-lg text-sm text-secondary whitespace-nowrap overflow-hidden shrink-0",
            "transition-[max-width] duration-300 ease-in-out",
            sidebarCollapsed ? "max-w-[36px]" : "max-w-full",
            pathname === href
                ? "bg-zinc-700 text-white"
                : "hover:bg-zinc-800 hover:text-white"
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
                "bg-foreground ml-[10px] mr-[5px] mb-[10px] rounded-2xl flex flex-col shrink-0 overflow-hidden p-4",
                "transition-[width] duration-300 ease-in-out",
                sidebarCollapsed ? "w-[74px]" : "w-[259px]"
            )}
        >
            <ScrollArea className="flex-1">
                {/* library header — always left-aligned, click to toggle */}
                <div
                    onClick={toggleSidebar}
                    className="flex items-center gap-4 px-2 py-2 mb-2 cursor-pointer text-sidebar hover:text-white transition-colors whitespace-nowrap overflow-hidden"
                >
                    <Image
                        src="/icons/library.svg"
                        alt="Library"
                        width={22}
                        height={22}
                        className="shrink-0"
                    />
                    <span className="ml-[-2px] flex-1 text-sm">My Library</span>
                    <ChevronLeft size={16} className="text-zinc-500 shrink-0" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            <Image src={item.icon} alt={item.label} width={20} height={20} className="shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={cn("px-[8px] transition-all duration-300", sidebarCollapsed && "px-0")}>
                    <Separator className="my-1.5 bg-border" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    {navItems2.map(item => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            <Image src={item.icon} alt={item.label} width={20} height={20} className="shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={cn("px-[8px] transition-all duration-300", sidebarCollapsed && "px-0")}>
                    <Separator className="my-1.5 bg-border" />
                </div>

                <nav className="space-y-1 font-satoshi">
                    {navItems3.map(item => (
                        <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                            <Image src={item.icon} alt={item.label} width={20} height={20} className="shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </ScrollArea>
        </aside>
    );
}
