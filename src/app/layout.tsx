import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0284c7",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://solaris-energia.pt"),
  title: "Solaris Portugal — As Melhores Empresas de Energia Solar | Apoios do Estado 2026",
  description:
    "Poupe até 75% na fatura da luz com os melhores instaladores certificados a nível nacional (DGEG). Vistoria 3D gratuita, 25 anos de garantia e gestão integral da candidatura ao Fundo Ambiental.",
  keywords: [
    "painéis solares portugal",
    "melhores empresas energia solar",
    "fundo ambiental 2026",
    "apoios estado paineis solares",
    "autoconsumo fotovoltaico moradia",
    "instaladores certificados dgeg",
    "poupança eletricidade",
  ],
  authors: [{ name: "Solaris Energia" }],
  openGraph: {
    title: "Solaris — Energia Solar Chave-na-Mão",
    description: "Reduza a sua fatura de energia em até 75%. Instalação residencial e industrial com 25 anos de garantia.",
    type: "website",
    locale: "pt_PT",
    images: [
      {
        url: "/images/solar-hero.jpg",
        width: 1200,
        height: 675,
        alt: "Instalação de Painéis Solares Solaris",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${plusJakarta.variable} scroll-smooth antialiased`}>
      <head>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '979841341182458');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=979841341182458&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
