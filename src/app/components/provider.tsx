import { NavidromeProvider } from "@/app/components/navidrome-context";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NavidromeProvider>
            {children}
        </NavidromeProvider>
    );
}
