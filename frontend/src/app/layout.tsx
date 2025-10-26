import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "HealthHome",
  description: "Health dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-800">
        <div className="min-h-screen grid grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="bg-white border-r border-gray-200 p-5">
            <h1 className="text-2xl font-bold mb-8 text-gray-900 tracking-wide">HealthHome</h1>
            <nav className="space-y-2">
              <Link
                className="block px-3 py-2 rounded-md hover:bg-gray-100 transition duration-200 text-gray-700"
                href="/"
              >
                Dashboard
              </Link>
              <Link
                className="block px-3 py-2 rounded-md hover:bg-gray-100 transition duration-200 text-gray-700"
                href="/termin"
              >
                Termine
              </Link>
            </nav>
          </aside>

          {/* Main */}
          <main className="p-8 bg-gray-50 text-gray-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
              <div className="text-sm text-gray-500">Prototype • v0</div>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
