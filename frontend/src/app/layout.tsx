import "./globals.css";
import MainLayout from "@/components/MainLayout";

export const metadata = {
  title: "HealthHome",
  description: "Health dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#0a0e1a] text-gray-100">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
