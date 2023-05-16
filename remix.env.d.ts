/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare global {
  interface Window {
    ENV: Record<string, string> | undefined;
  }
}
