import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'StoreHub Knowledge Base Auditor',
  description: 'AI-powered knowledge base health monitoring and content auditing platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0066cc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable}`} suppressHydrationWarning>
        <ErrorBoundary level="critical" showDetails={process.env.NODE_ENV === 'development'}>
          <AppProvider>
            <ThemeProvider>
              <div className="app-container">
                {/* Header */}
                <ErrorBoundary level="component">
                  <Header />
                </ErrorBoundary>

                <div className="app-content">
                  {/* Sidebar */}
                  <ErrorBoundary level="component">
                    <Sidebar />
                  </ErrorBoundary>

                  {/* Main content */}
                  <main className="main-content">
                    <div className="content-wrapper">
                      <ErrorBoundary level="page">
                        {children}
                      </ErrorBoundary>
                    </div>
                  </main>
                </div>
              </div>
            </ThemeProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
