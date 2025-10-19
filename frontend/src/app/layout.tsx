import "./globals.css";
import Link from "next/link";

export const metadata = { title: "HealthHome", description: "Health dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#0a0e1a] text-gray-100">
        <div className="min-h-screen grid grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="bg-[#0d1220] border-r border-gray-800 p-5 text-gray-200">
            <h1 className="text-2xl font-bold mb-8 text-white tracking-wide">HealthHome</h1>
            <nav className="space-y-2">
              <Link
                className="block px-3 py-2 rounded-md hover:bg-[#1b2338] hover:text-white transition duration-200"
                href="/"
              >
                Dashboard
              </Link>
              <Link
                className="block px-3 py-2 rounded-md hover:bg-[#1b2338] hover:text-white transition duration-200"
                href="/termin"
              >
                Termine
              </Link>
            </nav>
          </aside>

          {/* Main */}
          <main className="p-8 bg-[#0a0e1a] text-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-white">Overview</h2>
              <div className="text-sm text-gray-400">Prototype • v0</div>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
