"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface HorizontalSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function HorizontalSection({ title, children }: HorizontalSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const scrollAmount = 170 * 3 + 48; // 3 cards + gaps
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section className="mb-8 w-full">
            <div className="flex items-center justify-between mb-3 relative">
                <h2 className="text-lg font-semibold text-primary truncate">{title}</h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scroll("left")}
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-300 hover:bg-transparent"
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scroll("right")}
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-300 hover:bg-transparent"
                    >
                        <ArrowRight size={18} />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-zinc-300 hover:bg-transparent"
                            >
                                <MoreHorizontal size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Sort by Name</DropdownMenuItem>
                            <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>


            <div className="relative w-full">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-hidden"
                >
                    {children}
                </div>
            </div>
        </section>
    );
}
