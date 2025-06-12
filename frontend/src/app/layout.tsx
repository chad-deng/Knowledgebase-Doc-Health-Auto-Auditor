import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
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
      <body className={inter.className} suppressHydrationWarning>
        <AppProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              {/* Header */}
              <Header />
              
              <div className="flex">
                {/* Sidebar */}
                <Sidebar />
                
                {/* Main content */}
                <main className="flex-1 ml-64 p-6">
                  <div className="h-full">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </ThemeProvider>
        </AppProvider>
      </body>
    </html>
  );
}
