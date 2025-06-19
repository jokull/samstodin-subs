import { Logo } from "~/components/Logo";

import { signupAction } from "./actions";

export default function SignupPage() {

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-4">
        <Logo />
        <h1 className="mt-8 mb-4 text-3xl font-black">Nýskráning</h1>
        <p className="mb-6 text-gray-700">
          Með áskrift að Samstöðinni styrkir þú óháða fjölmiðlun. Byrjaðu á því
          að slá inn netfangið þitt.
        </p>

        <form action={signupAction}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Netfang
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              placeholder="netfang@example.com"
              required
              autoFocus
              className="w-full cursor-text rounded-md border border-gray-300 p-3 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-6 w-full cursor-pointer rounded-md bg-neutral-950 p-3 text-white transition-colors hover:bg-neutral-800"
          >
            Halda áfram
          </button>
        </form>

        <div className="mt-6 border-t pt-6 text-center">
          <p className="text-sm text-gray-600">
            Ertu þegar með aðgang?{" "}
            <a
              href="/login"
              className="cursor-pointer font-medium text-blue-600 hover:underline"
            >
              Skráðu þig inn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
