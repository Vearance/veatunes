import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen pt-3">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1  overflow-y-auto">
        </main>
      </div>
    </div>
  );
}
