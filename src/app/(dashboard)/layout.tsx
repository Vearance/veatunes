"use client";

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { QueuePanel } from "@/components/queue-panel";
// import { ScrollArea } from "@/components/ui/scroll-area";

// BUG: For some particular reason, the icons in the child (page.tsx) doesn't place well with scrollarea by shadcn - thus we use custom scrollbar.
// TODO: fix bug

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen pt-3">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-foreground ml-[5px] mr-[5px] mb-[10px] p-4 pb-20 rounded-2xl custom-scrollbar transition-all duration-300">
                    {children}
                </main>
                <QueuePanel />
            </div>
        </div>
    );
}
