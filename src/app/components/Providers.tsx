import { NavidromeProvider } from "@/app/components/NavidromeContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NavidromeProvider>
            {children}
        </NavidromeProvider>
    );
}
