/* eslint-env node */
import esbuild, { Plugin } from "esbuild";
import babel from "esbuild-plugin-babel";

const watch = process.argv.some((arg) => ["--watch", "-w"].includes(arg));

const context = await esbuild.context({
  bundle: true,
  platform: "node",
  target: "rhino1.7.14",
  external: ["kolmafia"],
  define: {
    "process.env.GITHUB_SHA": `"${process.env?.["GITHUB_SHA"] ?? "CustomBuild"}"`,
    "process.env.GITHUB_REF_NAME": `"${process.env?.["GITHUB_REF_NAME"] ?? "CustomBuild"}"`,
    "process.env.GITHUB_REPOSITORY": `"${process.env?.["GITHUB_REPOSITORY"] ?? "CustomBuild"}"`,
  },
  entryPoints: {
    "KoLmafia/scripts/loopstar/loopstar": "src/main.ts",
    "KoLmafia/scripts/loopstar/loopstar_choice": "src/standalone/loopstar_choice.ts",
    "KoLmafia/relay/relay_loopstar": "src/relay.ts",
  },
  entryNames: "[dir]/[name]",
  outdir: "dist",
  plugins: [babel() as Plugin],
});

await context.rebuild();

if (watch) {
  await context.watch();
} else {
  context.dispose();
}
