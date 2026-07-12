import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Odoo Hackathon 26",
  description: "Hackathon project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
