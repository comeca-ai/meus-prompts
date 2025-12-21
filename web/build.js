const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  const result = await esbuild.build({
    entryPoints: ['web/src/index.tsx'],
    bundle: true,
    write: false,
    format: 'iife', // Use IIFE for simple inclusion, or 'esm' if using type="module" in worker
    // Since we are injecting it, let's just make it a simple script.
    // Wait, React needs process.env.NODE_ENV.
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
  });

  const jsContent = result.outputFiles[0].text;

  // Basic CSS for now or empty if none used (inline styles in App.tsx)
  const cssContent = '';

  const outputContent = `
export const WIDGET_JS = ${JSON.stringify(jsContent)};
export const WIDGET_CSS = ${JSON.stringify(cssContent)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/widget_assets.ts'), outputContent);
  console.log('Build complete: src/widget_assets.ts created');
}

build().catch(() => process.exit(1));
