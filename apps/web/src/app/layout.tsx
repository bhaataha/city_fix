import type { Metadata } from 'next';
import { Inter, Noto_Sans_Hebrew } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const notoHebrew = Noto_Sans_Hebrew({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-noto-hebrew',
});

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
    <html lang="he" dir="rtl" suppressHydrationWarning className={`${inter.variable} ${notoHebrew.variable}`}>
      <body>{children}</body>
    </html>
  );
}
