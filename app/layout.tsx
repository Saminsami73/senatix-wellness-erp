import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Senatix Wellness • Medicine & Healthcare Distribution',
  description: 'Easy, accessible medicine distribution system for Senatix Wellness.',
  icons: {
    icon: '/brand/Senatix_Wellness_logo_transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark">
      <body className="antialiased bg-[#0b0c10] text-[#c0c4cd] text-sm selection:bg-[#de9489] selection:text-black transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
