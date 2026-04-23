import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CityFix — פלטפורמה עירונית לדיווח מפגעים',
  description: 'דווח על מפגעים עירוניים, עקוב אחר הטיפול בזמן אמת, ושלח תביעות תשתית — הכל במקום אחד.',
  keywords: ['מפגעים', 'עירייה', 'דיווח', 'תשתית', 'שירות', 'תביעות', 'cityfix'],
  openGraph: {
    title: 'CityFix — דיווח מפגעים עירוניים',
    description: 'הפלטפורמה המתקדמת ביותר לדיווח ומעקב אחר מפגעי תשתית עירוניים',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Hebrew:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
