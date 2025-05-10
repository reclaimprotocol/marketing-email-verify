import { Inter } from 'next/font/google';
import './globals.css';
import BackgroundLayout from './components/BackgroundLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bluecheck Verification over Email',
  description: 'Send a request to verify your users\' credentials over email',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackgroundLayout>
          {children}
        </BackgroundLayout>
      </body>
      <script id="warmly-script-loader" src="https://opps-widget.getwarmly.com/warmly.js?clientId=d1f887c224ce61e6a3463e764992fd93" defer></script>
    </html>
  );
}
