import { NavidromeProvider } from "@/components/navidrome-context";
import { PlayerProvider } from '@/components/player-context';
import { UIProvider } from '@/components/ui-context';
import { PlayerBar } from "@/components/player-bar";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NavidromeProvider>
            <PlayerProvider>
                <UIProvider>
                    {children}
                    <PlayerBar />
                </UIProvider>
            </PlayerProvider>
        </NavidromeProvider>
    );
}
