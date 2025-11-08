import { NavidromeProvider } from "@/components/navidrome-context";
import { PlayerProvider } from '@/components/player-context';
import { PlayerBar } from "@/components/player-bar";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NavidromeProvider>
            <PlayerProvider>
                {children}
                <PlayerBar />
            </PlayerProvider>
        </NavidromeProvider>
    );
}
