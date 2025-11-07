import { build } from "esbuild";

await build({
  entryPoints: ["src/server.ts", "src/scripts/migrate.ts", "src/scripts/seed.ts"],
  outdir: "dist",
  outbase: "src",
  platform: "node",
  target: "node22",
  format: "esm",
  bundle: true,
  sourcemap: true,
  packages: "external",
  alias: { "@": "./src" },
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
