import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "TerraForge — Visual Terraform Studio",
  description:
    "Build infrastructure visually. Understand every Terraform connection. A private, local-first Terraform learning and engineering studio.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
