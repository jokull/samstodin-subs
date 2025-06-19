import type { Metadata, Viewport } from "next";

import { env } from "~/env";

import "./global.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Samstöðin Áskriftir",
  metadataBase: new URL(
    `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`,
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="is" className="min-h-full">
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify({})}`,
          }}
        />
        <div className="p-6">{children}</div>
        <footer className="px-6 py-8 text-center text-xs text-neutral-500">
          <a href="http://samstodin.is/skilmalar" className="underline">
            Skilmálar & persónuverndarstefna
          </a>
        </footer>
      </body>
    </html>
  );
}
