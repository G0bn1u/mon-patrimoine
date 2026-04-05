import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "FINANCIAL Wealth OS",
  description: "Dashboard de gestion de patrimoine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className="dark">
        <body className="bg-slate-950 text-slate-50 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
