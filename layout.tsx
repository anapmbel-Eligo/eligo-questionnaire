import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ELIGO — Comunidad y Pertenencia',
  description: 'ELIGO es una iniciativa de infraestructura social para longevidad, pertenencia y formación comunitaria en personas mayores de 60 años en Ciudad de México.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-amber-950">
        {children}
      </body>
    </html>
  );
}
