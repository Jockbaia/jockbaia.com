import '../styles/global.scss';
import Header from './header/Header';
import Script from 'next/script';

export const metadata = {
  title: 'Jockbaia',
  description: 'what a day for a daydream',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <Script
          src="https://stats.picopod.fm/script.js"
          data-website-id="cd1ed67a-ecc1-49d8-b729-26800993865f"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
