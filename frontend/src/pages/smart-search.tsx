import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import AISmartSearch from "@/components/ai/AISmartSearch";

export default function SmartSearch() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-8">
        <AISmartSearch />
      </main>

      <Footer />
    </div>
  );
}