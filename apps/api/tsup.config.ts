import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: [/^@repo\//], // bundle workspace packages into the output
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
  platform: "node",
  target: "node18",
  esbuildOptions(options) {
    // Tell esbuild to also look in workspace packages' node_modules
    // for transitive dependencies (e.g. drizzle-orm from @repo/database)
    const root = path.resolve(__dirname, "../..");
    options.nodePaths = [
      path.join(root, "node_modules"),
      path.join(root, "packages/database/node_modules"),
      path.join(root, "packages/services/node_modules"),
      path.join(root, "packages/trpc/node_modules"),
      path.join(root, "packages/logger/node_modules"),
      path.join(root, "packages/validators/node_modules"),
    ];
  },
});
