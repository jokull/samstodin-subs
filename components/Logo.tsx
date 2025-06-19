export function Logo() {
  return (
    <div className="flex items-center gap-4 text-3xl font-black">
      <img
        src="/samstodin-logo-black.svg"
        width={91 / 2}
        height={72 / 2}
        className="mb-1"
        alt="Merki Samstöðvarinnar"
      />
      <h1>Samstöðin</h1>
    </div>
  );
}
