import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "~/components/Logo";
import { getHeroImage } from "~/lib/metadata";

import LoginContent from "./_components/login-content";

export default async function Page() {
  const heroImageUrl = await getHeroImage();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-xl px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href={{ pathname: "/" }} className="inline-block">
            <Logo />
          </Link>
        </div>

        {/* Hero Image */}
        {heroImageUrl && (
          <div className="mb-8">
            <img
              src={heroImageUrl}
              alt="Samstöðin"
              className="w-full rounded-lg shadow-lg object-cover h-64"
            />
          </div>
        )}

        {/* About Text */}
        <div className="mb-8 text-center">
          <p className="text-gray-700 leading-relaxed">
            Samstöðin er sjónvarps- og útvarpsstöð sem er vettvangur fyrir róttæka samfélagsumræðu og raddir þeirra sem ekki fá rúm í umfjöllun meginstraumsmiðla. Þættir Samstöðvarinnar eru allt í senn fréttir, fundir, sjónvarps-, útvarps- og hlaðvarpsþættir og innlegg í gagnvirka umræðu á samfélagsmiðlum.
          </p>
        </div>

        {/* Login Instructions */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-600">
            Til að styðja við Samstöðin stofnaðu fyrst reikning eða innskráðu þig ef þú ert nú þegar með reikning
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
