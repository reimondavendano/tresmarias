import './globals.css';
import type { Metadata } from 'next';
import { Inter, Open_Sans, Playfair_Display } from 'next/font/google';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { Toaster } from '@/components/ui/sonner';
import { FloatingMessengerButton } from '@/components/floatingMessengerButton';

const open = Open_Sans({ subsets: ['latin'], variable: '--font-inter' });
import { config } from '@fortawesome/fontawesome-svg-core';



export const metadata: Metadata = {
  title: 'Tres Duos - Tres Marias Salon',
  description: 'Experience luxury beauty treatments at Tres Marias Salon. Book your appointment today.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${open.variable} font-sans`}>
        <ReduxProvider>
          {children}
          <FloatingMessengerButton /> {/* Place it here */}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}