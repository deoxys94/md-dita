// ./src/md-dita.ts entry point
await Bun.build({
  entrypoints: ['./src/md-dita.ts'],
  outdir: './dist',
  target: 'browser',
  format: 'esm',
  minify: true,
});

// Build the CLI
await Bun.build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  target: 'node', // Changed from 'browser'
  format: 'esm',
  minify: true,
});

// Type Definitions
const proc = Bun.spawn(["bunx", "tsc", "--emitDeclarationOnly", "--outDir", "dist"]);
await proc.exited;

// 4. Fix Permissions for the CLI
import { chmodSync } from "fs";
chmodSync("./dist/main.js", 0o755);

console.log("Build successful: Browser and Node targets generated.");