import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Post a requirement | GoPratle',
  description: 'Find event planners, performers and crew for your event',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="nav">
          <div className="container nav-inner">
            <Link href="/" className="brand">
              GoPratle
            </Link>
            <div className="nav-links">
              <Link href="/">Post</Link>
              <Link href="/requirements">Browse</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
