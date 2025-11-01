import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
// import { ScrollArea } from "@/components/ui/scroll-area";

// BUG: For some particular reason, the icons in the child (page.tsx) doesn't place well with scrollarea by shadcn - thus we use custom scrollbar.
// TODO: fix bug

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen pt-3">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-foreground ml-[5px] mr-[10px] mb-[10px] p-4 rounded-2xl custom-scrollbar">
                    {/* <ScrollArea className="h-full"> */}
                        {children}
                    {/* </ScrollArea> */}
                </main>
            </div>
        </div>
    );
}
