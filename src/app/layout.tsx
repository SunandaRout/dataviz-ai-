import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataViz AI — Automated Analytics Platform',
  description: 'AI-powered analytics and Power BI-style dashboard generator',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
