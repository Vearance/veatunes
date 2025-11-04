import { NavidromeProvider } from "@/components/navidrome-context";
import { PlayerBar } from "@/components/player-bar";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NavidromeProvider>
            {children}
            <PlayerBar />
        </NavidromeProvider>
    );
}
