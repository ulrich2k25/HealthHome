import "./globals.css";
import Link from "next/link";

export const metadata = { title: "HealthHome", description: "Health dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-950 text-gray-100">
        <div className="min-h-screen grid grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="bg-gray-900 border-r border-gray-800 p-4">
            <h1 className="text-xl font-bold mb-6">HealthHome</h1>
            <nav className="space-y-2">
              <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/">Dashboard</Link>
              <Link className="block px-3 py-2 rounded hover:bg-gray-800" href="/termin">Termine</Link>
            </nav>
          </aside>

          {/* Main */}
          <main className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Overview</h2>
              <div className="text-sm text-gray-400">Prototype • v0</div>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
