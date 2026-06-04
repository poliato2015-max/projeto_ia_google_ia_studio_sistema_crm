import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Executive Lens | Portal de Vendas',
  description: 'Gestão de performance e CRM de alto nível.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${manrope.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const ignoreWords = ['metamask', 'ethereum', 'wallet', 'web3'];
                const isMuted = (str) => {
                  if (!str) return false;
                  const lower = String(str).toLowerCase();
                  return ignoreWords.some(word => lower.includes(word));
                };

                const originalConsoleError = console.error;
                console.error = function(...args) {
                  const errorString = args.map(arg => String(arg?.message || arg || '')).join(' ');
                  if (isMuted(errorString)) {
                    return;
                  }
                  originalConsoleError.apply(console, args);
                };

                const originalConsoleWarn = console.warn;
                console.warn = function(...args) {
                  const warnString = args.map(arg => String(arg?.message || arg || '')).join(' ');
                  if (isMuted(warnString)) {
                    return;
                  }
                  originalConsoleWarn.apply(console, args);
                };

                window.addEventListener('error', function(event) {
                  const msg = event?.message || '';
                  if (isMuted(msg)) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event?.reason?.message || String(event?.reason || '');
                  if (isMuted(reason)) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }, true);
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-inter antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
