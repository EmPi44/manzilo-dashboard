import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <Sidebar />
      {/* Main dashboard content will go here */}
      <main className="flex-1 p-8">Dashboard content</main>
    </div>
  );
}
