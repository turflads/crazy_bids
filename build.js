import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  packages: 'external',
  outdir: 'dist',
  banner: {
    js: `import{fileURLToPath}from'node:url';import{dirname}from'node:path';import.meta.dirname=import.meta.dirname||dirname(fileURLToPath(import.meta.url));`
  }
});

console.log('✅ Server build complete');
