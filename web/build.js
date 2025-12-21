const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function build() {
  console.log('Generating Tailwind CSS...');
  try {
    // Run tailwindcss CLI to generate output.css
    execSync('npx @tailwindcss/cli -i web/src/main.css -o web/src/output.css', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to generate CSS:', error);
    process.exit(1);
  }

  console.log('Building React App...');
  // Ensure dist directory exists
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  await esbuild.build({
    entryPoints: ['web/src/index.tsx'],
    bundle: true,
    write: true,
    outfile: 'web/dist/bundle.js', // Output file path
    format: 'iife',
    define: { 'process.env.NODE_ENV': '"production"' },
    minify: true,
    loader: {
      '.module.css': 'local-css', // Handle CSS modules natively
      '.css': 'css', // Handle standard CSS (like output.css) natively
      '.js': 'jsx', // Ensure JS files are treated as JSX if needed
    },
  });

  // Read the generated bundle JS
  const jsContent = fs.readFileSync(path.join(__dirname, 'dist/bundle.js'), 'utf8');

  // Read the generated bundle CSS (esbuild generates this if there are CSS imports)
  const cssPath = path.join(__dirname, 'dist/bundle.css');
  let cssContent = '';
  if (fs.existsSync(cssPath)) {
    cssContent = fs.readFileSync(cssPath, 'utf8');
  }

  const outputContent = `
export const WIDGET_JS = ${JSON.stringify(jsContent)};
export const WIDGET_CSS = ${JSON.stringify(cssContent)};
`;

  fs.writeFileSync(path.join(__dirname, '../src/widget_assets.ts'), outputContent);
  console.log('Build complete: src/widget_assets.ts created');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
