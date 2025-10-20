import { eq } from "drizzle-orm";

import { db } from "~/lib/db";
import { Settings } from "~/schema";

import HeroUploader from "./_components/hero-uploader";
import OpenGraphUploader from "./_components/opengraph-uploader";

export default async function SettingsPage() {
  const [openGraphSetting, heroSetting] = await Promise.all([
    db.query.Settings.findFirst({
      where: eq(Settings.key, "opengraph_image_url"),
    }),
    db.query.Settings.findFirst({
      where: eq(Settings.key, "hero_image_url"),
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stillingar</h2>
        <p className="mt-1 text-sm text-gray-600">
          Stjórna almennum stillingum fyrir síðuna.
        </p>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            OpenGraph mynd
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Þessi mynd birtist þegar síðunni er deilt á samfélagsmiðlum.
              Ráðlögð stærð: 1200x630 px.
            </p>
          </div>
          <div className="mt-5">
            <OpenGraphUploader
              initialImageUrl={openGraphSetting?.value || null}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Hero mynd
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Þessi mynd birtist á innskráningarsíðunni sem bakgrunnsmynd.
              Ráðlögð stærð: 1920x1080 px eða hærri.
            </p>
          </div>
          <div className="mt-5">
            <HeroUploader
              initialImageUrl={heroSetting?.value || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
