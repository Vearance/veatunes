"use client"

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Search, Settings, ChartNoAxesColumn, UserRound } from "lucide-react";
import { useNavidrome } from '@/components/navidrome-context';
import { User } from '@/lib/navidrome';
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

export default function Header() {
    const { api, isConnected } = useNavidrome();
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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

    const handleLogout = () => {
        localStorage.removeItem('navidrome-config');
        window.location.reload();
    };

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
        <header className="grid grid-cols-[274px_1fr_274px] items-center mb-8">
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

            <div className="flex items-center gap-2 w-full max-w-[331px] justify-self-center">
                <Search
                    className="text-secondary shrink-0 mr-1"
                    size={24} />
                <Input
                    type="text"
                    placeholder="Search..."
                    className="bg-input text-zinc-300 placeholder-zinc-500 font-satoshi rounded-sm border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>

            <div className="flex items-center justify-end gap-4">
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
