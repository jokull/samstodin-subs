import { Logo } from "~/components/Logo";

export default function Stadfesting() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-xl px-4">
        <Logo />
        <div className="mt-4">
          Þú færð núna tölvupóst frá okkur með hlekk. Smelltu á hann til að
          staðfesta skráninguna.
        </div>
      </div>
    </div>
  );
}
