import type { Metadata, Viewport } from "next";

import { env } from "~/env";
import { getOpenGraphImage } from "~/lib/metadata";

import "./global.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const openGraphImageUrl = await getOpenGraphImage();

  console.log(openGraphImageUrl);

  return {
    title: "Samstöðin Áskriftir",
    description: "Gerðu þig að áskrifanda að Samstöðinni",
    metadataBase: new URL(
      `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`,
    ),
    openGraph: {
      title: "Samstöðin Áskriftir",
      description: "Gerðu þig að áskrifanda að Samstöðinni",
      siteName: "Samstöðin",
      images: openGraphImageUrl
        ? [
            {
              url: openGraphImageUrl,
              width: 1200,
              height: 630,
              alt: "Samstöðin",
            },
          ]
        : ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Samstöðin Áskriftir",
      description: "Gerðu þig að áskrifanda að Samstöðinni",
      images: openGraphImageUrl ? [openGraphImageUrl] : ["/opengraph-image"],
    },
  };
}

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
