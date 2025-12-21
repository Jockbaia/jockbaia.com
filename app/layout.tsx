import '../styles/global.scss';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://jockbaia.com'),
  title: 'Jockbaia',
  description: 'what a day for a daydream',
  other: {
    'fediverse:creator': '@jockbaia@picopod.fm',
    'google-site-verification': '3rfyCNc1yv3NBpT97mlx9g_0rmMZ1D4f0uizZdyA0q0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
