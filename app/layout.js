import { Inter } from 'next/font/google';
import './globals.css';
import BackgroundLayout from './components/BackgroundLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Email Verification',
  description: 'Verify your email address securely',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackgroundLayout>
          {children}
        </BackgroundLayout>
      </body>
    </html>
  );
}
