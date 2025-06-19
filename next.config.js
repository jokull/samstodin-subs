import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build
jiti("./env.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
