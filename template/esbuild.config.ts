import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./app/main.ts'],
  bundle: true,
  outfile: './dist/main.js',
  sourcemap: true,
  minify: true,
  platform: 'browser',
})
