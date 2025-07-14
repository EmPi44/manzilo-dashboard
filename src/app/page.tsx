import Sidebar from "../components/Sidebar";
import MetricCardRow from "../components/MetricCardRow";
import Map from "../components/Map";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#232946] via-[#3a3f5a] to-[#1a1a2e] p-4 sm:p-8 lg:p-12">
      <div className="flex bg-white/40 backdrop-blur-2xl rounded-3xl shadow-2xl w-full h-full max-w-[calc(100vw-6rem)] max-h-[calc(100vh-6rem)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <MetricCardRow />
          <div className="mt-8">
            <Map />
          </div>
        </main>
      </div>
    </div>
  );
}
